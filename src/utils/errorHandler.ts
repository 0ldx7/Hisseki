export const logError = (message: string, errorData: any) => {
    console.error(message);
    if (errorData) {
        console.error(errorData);
    }
};

