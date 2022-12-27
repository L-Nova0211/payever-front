import { FolderItem } from '@pe/folders';
import { PeSocialRoutingPathsEnum } from './enums';
import { PeSocialChannelRuleInterface, PeSocialChannelsRuleInterface } from './interfaces';

export const PE_SOCIAL_CONTAINER = 'social';

export const ICONS = {
  calendar: '../assets/icons/calendar.svg',
  connect: '../assets/icons/connect.svg',
  posts: '../assets/icons/posts.svg',
  facebook: '../assets/icons/facebook-posts.svg',
  instagram: '../assets/icons/instagram-posts.svg',
  linkedin: '../assets/icons/linkedin.svg',
  time: '../assets/icons/time.svg',
  twitter: '../assets/icons/twitter.svg',
  youtube: '../assets/icons/youtube.svg',
  pinterest: '../assets/icons/pinterest.svg',
};

export const SOCIAL_NAVIGATION: FolderItem<{ link: PeSocialRoutingPathsEnum }>[] = [
  {
    _id: '0',
    position: 0,
    name: 'social-app.folders.title',
    image: ICONS.posts,
    isProtected: true,
    data: {
      link: PeSocialRoutingPathsEnum.Posts,
    },
  },
  {
    _id: '1',
    position: 1,
    name: 'social-app.connect.title',
    image: ICONS.connect,
    isProtected: true,
    data: {
      link: PeSocialRoutingPathsEnum.Connect,
    },
  },
];

const FACEBOOK_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxFileSize: (5 * 1024 * 1024),
    imagesPerPost: 15,
    aspectRatio: {
      min: null,
      max: null,
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (1024 * 1024 * 1024),
    duration: { min: 1, max: 1200 },
    maxResolution: { width: null, height: null },
    aspectRatio: { min: (9 / 16), max: (16 / 9) },
    maxBitrate: null,
    framerate: { min: null, max: null },
  },
};

const INSTAGRAM_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxFileSize: (5 * 1024 * 1024),
    imagesPerPost: 10,
    aspectRatio: {
      min: (4 / 5),
      max: (1.91 / 1),
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (100 * 1024 * 1024),
    duration: { min: 3, max: 60 },
    maxResolution: { width: 1920, height: null },
    aspectRatio: { min: (4 / 5), max: (16 / 9) },
    maxBitrate: 5120,
    framerate: { min: 23, max: 60 },
  },
};

const LINKEDIN_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxFileSize: (5 * 1024 * 1024),
    imagesPerPost: 9,
    aspectRatio: {
      min: null,
      max: null,
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (512 * 1024 * 1024),
    duration: { min: 3, max: 600 },
    maxResolution: { width: 4096, height: 2304 },
    aspectRatio: { min: (1 / 2.4), max: (2.4 / 1) },
    maxBitrate: 30720,
    framerate: { min: 10, max: 60 },
  },
};

const TWITTER_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxFileSize: (3 * 1024 * 1024),
    imagesPerPost: 4,
    aspectRatio: {
      min: null,
      max: null,
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (512 * 1024 * 1024),
    duration: { min: 3, max: 600 },
    maxResolution: { width: 4096, height: 2304 },
    aspectRatio: { min: (1 / 2.4), max: (2.4 / 1) },
    maxBitrate: 30720,
    framerate: { min: 10, max: 60 },
  },
};

const YOUTUBE_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: [],
    maxFileSize: null,
    imagesPerPost: 0,
    aspectRatio: {
      min: null,
      max: null,
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (512 * 1024 * 1024),
    duration: { min: 3, max: 600 },
    maxResolution: { width: 4096, height: 2304 },
    aspectRatio: { min: (1 / 2.4), max: (2.4 / 1) },
    maxBitrate: 30720,
    framerate: { min: 10, max: 60 },
  },
};

const PINTEREST_RULES: PeSocialChannelRuleInterface = {
  image: {
    formats: ['jpg', 'jpeg', 'png'],
    maxFileSize: (5 * 1024 * 1024),
    imagesPerPost: 10,
    aspectRatio: {
      min: (4 / 5),
      max: (1.91 / 1),
    },
  },
  video: {
    webFormat: ['mp4', 'mov'],
    iosFormat: ['mov'],
    androidFormat: ['mp4'],
    maxFileSize: (100 * 1024 * 1024),
    duration: { min: 3, max: 60 },
    maxResolution: { width: 1920, height: null },
    aspectRatio: { min: (4 / 5), max: (16 / 9) },
    maxBitrate: 5120,
    framerate: { min: 23, max: 60 },
  },
};

export const CHANNELS_RULES: PeSocialChannelsRuleInterface = {
  facebook: FACEBOOK_RULES,
  instagram: INSTAGRAM_RULES,
  linkedin: LINKEDIN_RULES,
  twitter: TWITTER_RULES,
  youtube: YOUTUBE_RULES,
  pinterest: PINTEREST_RULES,
};

export const CHANNELS_COLORS = {
  facebook: '#3b68b5',
  instagram: '#f11976',
  linkedin: '#0077b5',
  twitter: '#1da1f2-#1385ca',
  youtube: '#ff0000',
  pinterest: '#c8232c',
};
