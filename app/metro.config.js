const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;
  const projectRoot = __dirname;
  const workspaceRoot = path.resolve(projectRoot, "..");

  const resolveProjectFile = (context, targetPath, platform) => {
    const relativePath = path.relative(
      path.dirname(context.originModulePath),
      targetPath,
    );
    const requestPath = relativePath.startsWith(".")
      ? relativePath
      : `./${relativePath}`;

    return context.resolveRequest(
      context,
      requestPath.replace(/\\/g, "/"),
      platform,
    );
  };

  const resolveWithAlias = (context, moduleName, platform) => {
    if (moduleName.startsWith("@/")) {
      const targetPath = path.resolve(projectRoot, moduleName.slice(2));
      return resolveProjectFile(context, targetPath, platform);
    }

    if (moduleName === "@brand") {
      return resolveProjectFile(
        context,
        path.resolve(workspaceRoot, "brand.json"),
        platform,
      );
    }

    return context.resolveRequest(context, moduleName, platform);
  };

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };
  config.watchFolders = [
    ...(config.watchFolders ?? []),
    workspaceRoot,
  ];
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    resolveRequest: resolveWithAlias,
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  return config;
})();
