export interface PeSocialChannelRuleInterface {
  image: {
    formats: string[];
    maxFileSize: number;
    imagesPerPost: number;
    aspectRatio: {
      min: number;
      max: number;
    };
  };
  video: {
    webFormat: string[];
    iosFormat: string[];
    androidFormat: string[];
    maxFileSize: number;
    duration: {
      min: number;
      max: number;
    };
    maxResolution: {
      width: number;
      height: number;
    };
    aspectRatio: {
      min: number;
      max: number;
    };
    maxBitrate: number;
    framerate: {
      min: number;
      max: number;
    };
  };
}

export interface PeSocialChannelsRuleInterface {
  [key: string]: PeSocialChannelRuleInterface;
}
