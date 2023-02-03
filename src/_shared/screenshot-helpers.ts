export const imageType = "png";
export const directory = "screenshots/";

export const formatScreenshotFile = (fileName: string) => {
    return `${directory}${formatName(fileName)}`;
};

export const formatName = (fileName: string) => {
    return `${fileName}.${imageType}`;
};
