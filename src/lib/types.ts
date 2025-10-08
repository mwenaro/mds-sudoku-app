export interface UserType {
    email: string;
    name: string;
    username: string;
}

export interface GameType {
    userId: string;
    level: number;
    timeTaken: number;
    date: Date;
}