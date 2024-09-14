interface GitlabTag {
    version: string;
    comments: string;
    date: string | null;
    user_thumbnail: string | null;
    user_name: string;
    isRelease(): boolean;
}