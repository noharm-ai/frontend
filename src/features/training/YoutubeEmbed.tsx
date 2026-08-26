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

// keeps playback controls (pause/seek are needed in training), but strips
// everything else the player offers: branding, annotations and related videos
const PLAYER_PARAMS = {
  autoplay: "1",
  modestbranding: "1",
  rel: "0",
  iv_load_policy: "3",
  playsinline: "1",
};

const getEmbedUrl = (url: string): string => {
  const match = url.match(YOUTUBE_ID_PATTERN);

  if (!match) {
    return url;
  }

  const params = new URLSearchParams(PLAYER_PARAMS);

  return `https://www.youtube-nocookie.com/embed/${match[1]}?${params}`;
};

interface YoutubeEmbedProps {
  url: string;
  title: string;
  moduleName: string | number;
}

export function YoutubeEmbed({ url, title, moduleName }: YoutubeEmbedProps) {
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
                {t("trainingPlayer.videoCoverBrand", { module: moduleName })}
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
              {t("trainingPlayer.videoCoverModule", { module: moduleName })}
            </span>
          </CoverTitle>
        </VideoCover>
      </VideoWrapper>
    );
  }

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
