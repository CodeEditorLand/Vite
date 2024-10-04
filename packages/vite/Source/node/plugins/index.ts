import aliasPlugin, { type ResolverFunction } from "@rollup/plugin-alias";
import type { ObjectHook } from "rollup";

import {
	isDepsOptimizerEnabled,
	type PluginHookUtils,
	type ResolvedConfig,
} from "../config";
import { getFsUtils } from "../fsUtils";
import { getDepsOptimizer } from "../optimizer";
import { watchPackageDataPlugin } from "../packages";
import type { HookHandler, Plugin, PluginWithRequiredHook } from "../plugin";
import { shouldExternalizeForSSR } from "../ssr/ssrExternal";
import { assetPlugin } from "./asset";
import { assetImportMetaUrlPlugin } from "./assetImportMetaUrl";
import { clientInjectionsPlugin } from "./clientInjections";
import { cssAnalysisPlugin, cssPlugin, cssPostPlugin } from "./css";
import { definePlugin } from "./define";
import { dynamicImportVarsPlugin } from "./dynamicImportVars";
import { esbuildPlugin } from "./esbuild";
import { buildHtmlPlugin, htmlInlineProxyPlugin } from "./html";
import { importAnalysisPlugin } from "./importAnalysis";
import { importGlobPlugin } from "./importMetaGlob";
import { jsonPlugin } from "./json";
import { metadataPlugin } from "./metadata";
import { modulePreloadPolyfillPlugin } from "./modulePreloadPolyfill";
import { optimizedDepsPlugin } from "./optimizedDeps";
import { preAliasPlugin } from "./preAlias";
import { resolvePlugin } from "./resolve";
import { wasmFallbackPlugin, wasmHelperPlugin } from "./wasm";
import { webWorkerPlugin } from "./worker";
import { workerImportMetaUrlPlugin } from "./workerImportMetaUrl";

export async function resolvePlugins(
	config: ResolvedConfig,
	prePlugins: Plugin[],
	normalPlugins: Plugin[],
	postPlugins: Plugin[],
): Promise<Plugin[]> {
	const isBuild = config.command === "build";
	const isWorker = config.isWorker;
	const buildPlugins = isBuild
		? await (await import("../build")).resolveBuildPlugins(config)
		: { pre: [], post: [] };
	const { modulePreload } = config.build;
	const depsOptimizerEnabled =
		!isBuild &&
		(isDepsOptimizerEnabled(config, false) ||
			isDepsOptimizerEnabled(config, true));
	return [
		depsOptimizerEnabled ? optimizedDepsPlugin(config) : null,
		isBuild ? metadataPlugin() : null,
		!isWorker ? watchPackageDataPlugin(config.packageCache) : null,
		preAliasPlugin(config),
		aliasPlugin({
			entries: config.resolve.alias,
			customResolver: viteAliasCustomResolver,
		}),
		...prePlugins,
		modulePreload !== false && modulePreload.polyfill
			? modulePreloadPolyfillPlugin(config)
			: null,
		resolvePlugin({
			...config.resolve,
			root: config.root,
			isProduction: config.isProduction,
			isBuild,
			packageCache: config.packageCache,
			ssrConfig: config.ssr,
			asSrc: true,
			fsUtils: getFsUtils(config),
			getDepsOptimizer: isBuild
				? undefined
				: (ssr: boolean) => getDepsOptimizer(config, ssr),
			shouldExternalize:
				isBuild && config.build.ssr
					? (id, importer) =>
							shouldExternalizeForSSR(id, importer, config)
					: undefined,
		}),
		htmlInlineProxyPlugin(config),
		cssPlugin(config),
		config.esbuild !== false ? esbuildPlugin(config) : null,
		jsonPlugin(
			{
				namedExports: true,
				...config.json,
			},
			isBuild,
		),
		wasmHelperPlugin(config),
		webWorkerPlugin(config),
		assetPlugin(config),
		...normalPlugins,
		wasmFallbackPlugin(),
		definePlugin(config),
		cssPostPlugin(config),
		isBuild && buildHtmlPlugin(config),
		workerImportMetaUrlPlugin(config),
		assetImportMetaUrlPlugin(config),
		...buildPlugins.pre,
		dynamicImportVarsPlugin(config),
		importGlobPlugin(config),
		...postPlugins,
		...buildPlugins.post,
		// internal server-only plugins are always applied after everything else
		...(isBuild
			? []
			: [
					clientInjectionsPlugin(config),
					cssAnalysisPlugin(config),
					importAnalysisPlugin(config),
				]),
	].filter(Boolean) as Plugin[];
}

export function createPluginHookUtils(
	plugins: readonly Plugin[],
): PluginHookUtils {
	// sort plugins per hook
	const sortedPluginsCache = new Map<keyof Plugin, Plugin[]>();
	function getSortedPlugins<K extends keyof Plugin>(
		hookName: K,
	): PluginWithRequiredHook<K>[] {
		if (sortedPluginsCache.has(hookName))
			return sortedPluginsCache.get(
				hookName,
			) as PluginWithRequiredHook<K>[];
		const sorted = getSortedPluginsByHook(hookName, plugins);
		sortedPluginsCache.set(hookName, sorted);
		return sorted;
	}
	function getSortedPluginHooks<K extends keyof Plugin>(
		hookName: K,
	): NonNullable<HookHandler<Plugin[K]>>[] {
		const plugins = getSortedPlugins(hookName);
		return plugins.map((p) => getHookHandler(p[hookName])).filter(Boolean);
	}

	return {
		getSortedPlugins,
		getSortedPluginHooks,
	};
}

export function getSortedPluginsByHook<K extends keyof Plugin>(
	hookName: K,
	plugins: readonly Plugin[],
): PluginWithRequiredHook<K>[] {
	const sortedPlugins: Plugin[] = [];
	// Use indexes to track and insert the ordered plugins directly in the
	// resulting array to avoid creating 3 extra temporary arrays per hook
	let pre = 0,
		normal = 0,
		post = 0;
	for (const plugin of plugins) {
		const hook = plugin[hookName];
		if (hook) {
			if (typeof hook === "object") {
				if (hook.order === "pre") {
					sortedPlugins.splice(pre++, 0, plugin);
					continue;
				}
				if (hook.order === "post") {
					sortedPlugins.splice(pre + normal + post++, 0, plugin);
					continue;
				}
			}
			sortedPlugins.splice(pre + normal++, 0, plugin);
		}
	}

	return sortedPlugins as PluginWithRequiredHook<K>[];
}

export function getHookHandler<T extends ObjectHook<Function>>(
	hook: T,
): HookHandler<T> {
	return (typeof hook === "object" ? hook.handler : hook) as HookHandler<T>;
}

// Same as `@rollup/plugin-alias` default resolver, but we attach additional meta
// if we can't resolve to something, which will error in `importAnalysis`
export const viteAliasCustomResolver: ResolverFunction = async function (
	id,
	importer,
	options,
) {
	const resolved = await this.resolve(id, importer, options);
	return resolved || { id, meta: { "vite:alias": { noResolved: true } } };
};
