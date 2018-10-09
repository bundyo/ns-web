function convertSlashesInPath(modulePath) {
    if (isWindows) {
        modulePath = modulePath.replace(/\\/g, "/");
    }
    return modulePath;
}

const isWindows = process.platform.startsWith("win32");

module.exports = function (source) {
    this.cacheable();
    const { modules } = this.query;
    const imports = modules.map(convertSlashesInPath)
        .map(m => `require("${m}");`).join("\n");
    const augmentedSource = `
        let applicationCheckPlatform = require("tns-core-modules/application");
        if (applicationCheckPlatform.web && !global["__snapshot"]) {
            ${imports}
        }

        ${source}
    `;

    this.callback(null, augmentedSource);
};
