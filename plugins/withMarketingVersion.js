const { withXcodeProject } = require("@expo/config-plugins");

module.exports = (config) => {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    const version = config.version || "1.0.0";
    
    for (const key in configurations) {
      if (configurations[key] && typeof configurations[key].buildSettings !== "undefined") {
        const buildSettings = configurations[key].buildSettings;
        // Update MARKETING_VERSION if it exists
        if (buildSettings.MARKETING_VERSION !== undefined) {
          buildSettings.MARKETING_VERSION = `"${version}"`;
        }
      }
    }
    return config;
  });
};
