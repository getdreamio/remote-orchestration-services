export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        if (error.status === 403) {
            return "You don't have permission to perform this action.";
        }
        if (error.status === 401) {
            return "Please log in to continue.";
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "An unexpected error occurred.";
};
