import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretRightOutlined } from "@ant-design/icons";

import {
  VideoWrapper,
  VideoCover,
  CoverShape,
  CoverBrand,
  CoverPlayButton,
  CoverTitle,
} from "./TrainingPlayer.style";

const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

const getEmbedUrl = (url: string): string => {
  const match = url.match(YOUTUBE_ID_PATTERN);

  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

interface YoutubeEmbedProps {
  url: string;
  title: string;
  trainingId: number;
}

export function YoutubeEmbed({ url, title, trainingId }: YoutubeEmbedProps) {
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <VideoWrapper>
        <VideoCover onClick={() => setStarted(true)}>
          <CoverShape />

          <CoverBrand>
            <span className="avatar" />
            <div>
              <strong>
                {t("trainingPlayer.videoCoverBrand", { module: trainingId })}
              </strong>
              <span>{t("trainingPlayer.videoCoverOrg")}</span>
            </div>
          </CoverBrand>

          <CoverPlayButton>
            <CaretRightOutlined />
          </CoverPlayButton>

          <CoverTitle>
            <span>{t("trainingPlayer.videoCoverTitle")}</span>
            <span>
              {t("trainingPlayer.videoCoverModule", { module: trainingId })}
            </span>
          </CoverTitle>
        </VideoCover>
      </VideoWrapper>
    );
  }

  const embedUrl = getEmbedUrl(url);
  const autoplayUrl = `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`;

  return (
    <VideoWrapper>
      <iframe
        src={autoplayUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </VideoWrapper>
  );
}
