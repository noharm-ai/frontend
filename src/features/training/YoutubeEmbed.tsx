import { VideoWrapper } from "./TrainingPlayer.style";

const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const getEmbedUrl = (url: string): string => {
  const match = url.match(YOUTUBE_ID_PATTERN);

  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

interface YoutubeEmbedProps {
  url: string;
  title: string;
}

export function YoutubeEmbed({ url, title }: YoutubeEmbedProps) {
  return (
    <VideoWrapper>
      <iframe
        src={getEmbedUrl(url)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </VideoWrapper>
  );
}
