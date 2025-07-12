function extractYouTubeEmbedUrl(originalUrl) {
    if (!originalUrl) return null;

    try {
        const urlObj = new URL(originalUrl);
        let videoId = null;

        if (urlObj.hostname.includes("youtube.com")) {
            videoId = urlObj.searchParams.get("v");
        } else if (urlObj.hostname.includes("youtu.be")) {
            videoId = urlObj.pathname.split("/")[1];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }

        return null;
    } catch (err) {
        return null;
    }
}

module.exports = { extractYouTubeEmbedUrl };
