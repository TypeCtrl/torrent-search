export interface TorznabCategory {
  id: number;
  name: string;
}

/* tslint:disable:variable-name */
const Console: TorznabCategory = { id: 1000, name: 'Console' };
const ConsoleNDS: TorznabCategory = { id: 1010, name: 'Console/NDS' };
const ConsolePSP: TorznabCategory = { id: 1020, name: 'Console/PSP' };
const ConsoleWii: TorznabCategory = { id: 1030, name: 'Console/Wii' };
const ConsoleXbox: TorznabCategory = { id: 1040, name: 'Console/Xbox' };
const ConsoleXbox360: TorznabCategory = { id: 1050, name: 'Console/Xbox 360' };
const ConsoleWiiwareVC: TorznabCategory = { id: 1060, name: 'Console/Wiiware/VC' };
const ConsoleXBOX360DLC: TorznabCategory = { id: 1070, name: 'Console/XBOX 360 DLC' };
const ConsolePS3: TorznabCategory = { id: 1080, name: 'Console/PS3' };
const ConsoleOther: TorznabCategory = { id: 1090, name: 'Console/Other' };
const Console3DS: TorznabCategory = { id: 1110, name: 'Console/3DS' };
const ConsolePSVita: TorznabCategory = { id: 1120, name: 'Console/PS Vita' };
const ConsoleWiiU: TorznabCategory = { id: 1130, name: 'Console/WiiU' };
const ConsoleXboxOne: TorznabCategory = { id: 1140, name: 'Console/Xbox One' };
const ConsolePS4: TorznabCategory = { id: 1180, name: 'Console/PS4' };
const Movies: TorznabCategory = { id: 2000, name: 'Movies' };
const MoviesForeign: TorznabCategory = { id: 2010, name: 'Movies/Foreign' };
const MoviesOther: TorznabCategory = { id: 2020, name: 'Movies/Other' };
const MoviesSD: TorznabCategory = { id: 2030, name: 'Movies/SD' };
const MoviesHD: TorznabCategory = { id: 2040, name: 'Movies/HD' };
const MoviesUHD: TorznabCategory = { id: 2045, name: 'Movies/UHD' };
const Movies3D: TorznabCategory = { id: 2050, name: 'Movies/3D' };
const MoviesBluRay: TorznabCategory = { id: 2060, name: 'Movies/BluRay' };
const MoviesDVD: TorznabCategory = { id: 2070, name: 'Movies/DVD' };
const MoviesWEBDL: TorznabCategory = { id: 2080, name: 'Movies/WEBDL' };
const Audio: TorznabCategory = { id: 3000, name: 'Audio' };
const AudioMP3: TorznabCategory = { id: 3010, name: 'Audio/MP3' };
const AudioVideo: TorznabCategory = { id: 3020, name: 'Audio/Video' };
const AudioAudiobook: TorznabCategory = { id: 3030, name: 'Audio/Audiobook' };
const AudioLossless: TorznabCategory = { id: 3040, name: 'Audio/Lossless' };
const AudioOther: TorznabCategory = { id: 3050, name: 'Audio/Other' };
const AudioForeign: TorznabCategory = { id: 3060, name: 'Audio/Foreign' };
const PC: TorznabCategory = { id: 4000, name: 'PC' };
const PC0day: TorznabCategory = { id: 4010, name: 'PC/0day' };
const PCISO: TorznabCategory = { id: 4020, name: 'PC/ISO' };
const PCMac: TorznabCategory = { id: 4030, name: 'PC/Mac' };
const PCPhoneOther: TorznabCategory = { id: 4040, name: 'PC/Phone-Other' };
const PCGames: TorznabCategory = { id: 4050, name: 'PC/Games' };
const PCPhoneIOS: TorznabCategory = { id: 4060, name: 'PC/Phone-IOS' };
const PCPhoneAndroid: TorznabCategory = { id: 4070, name: 'PC/Phone-Android' };
const TV: TorznabCategory = { id: 5000, name: 'TV' };
const TVWEBDL: TorznabCategory = { id: 5010, name: 'TV/WEB-DL' };
const TVFOREIGN: TorznabCategory = { id: 5020, name: 'TV/FOREIGN' };
const TVSD: TorznabCategory = { id: 5030, name: 'TV/SD' };
const TVHD: TorznabCategory = { id: 5040, name: 'TV/HD' };
const TVUHD: TorznabCategory = { id: 5045, name: 'TV/UHD' };
const TVOTHER: TorznabCategory = { id: 5050, name: 'TV/OTHER' };
const TVSport: TorznabCategory = { id: 5060, name: 'TV/Sport' };
const TVAnime: TorznabCategory = { id: 5070, name: 'TV/Anime' };
const TVDocumentary: TorznabCategory = { id: 5080, name: 'TV/Documentary' };
const XXX: TorznabCategory = { id: 6000, name: 'XXX' };
const XXXDVD: TorznabCategory = { id: 6010, name: 'XXX/DVD' };
const XXXWMV: TorznabCategory = { id: 6020, name: 'XXX/WMV' };
const XXXXviD: TorznabCategory = { id: 6030, name: 'XXX/XviD' };
const XXXx264: TorznabCategory = { id: 6040, name: 'XXX/x264' };
const XXXOther: TorznabCategory = { id: 6050, name: 'XXX/Other' };
const XXXImageset: TorznabCategory = { id: 6060, name: 'XXX/Imageset' };
const XXXPacks: TorznabCategory = { id: 6070, name: 'XXX/Packs' };
const Other: TorznabCategory = { id: 7000, name: 'Other' };
const OtherMisc: TorznabCategory = { id: 7010, name: 'Other/Misc' };
const OtherHashed: TorznabCategory = { id: 7020, name: 'Other/Hashed' };
const Books: TorznabCategory = { id: 8000, name: 'Books' };
const BooksEbook: TorznabCategory = { id: 8010, name: 'Books/Ebook' };
const BooksComics: TorznabCategory = { id: 8020, name: 'Books/Comics' };
const BooksMagazines: TorznabCategory = { id: 8030, name: 'Books/Magazines' };
const BooksTechnical: TorznabCategory = { id: 8040, name: 'Books/Technical' };
const BooksOther: TorznabCategory = { id: 8050, name: 'Books/Other' };
const BooksForeign: TorznabCategory = { id: 8060, name: 'Books/Foreign' };

export const ALL_CATS = [
  Console,
  ConsoleNDS,
  ConsolePSP,
  ConsoleWii,
  ConsoleXbox,
  ConsoleXbox360,
  ConsoleWiiwareVC,
  ConsoleXBOX360DLC,
  ConsolePS3,
  ConsoleOther,
  Console3DS,
  ConsolePSVita,
  ConsoleWiiU,
  ConsoleXboxOne,
  ConsolePS4,
  Movies,
  MoviesForeign,
  MoviesOther,
  MoviesSD,
  MoviesHD,
  MoviesUHD,
  Movies3D,
  MoviesBluRay,
  MoviesDVD,
  MoviesWEBDL,
  Audio,
  AudioMP3,
  AudioVideo,
  AudioAudiobook,
  AudioLossless,
  AudioOther,
  AudioForeign,
  PC,
  PC0day,
  PCISO,
  PCMac,
  PCPhoneOther,
  PCGames,
  PCPhoneIOS,
  PCPhoneAndroid,
  TV,
  TVWEBDL,
  TVFOREIGN,
  TVSD,
  TVHD,
  TVUHD,
  TVOTHER,
  TVSport,
  TVAnime,
  TVDocumentary,
  XXX,
  XXXDVD,
  XXXWMV,
  XXXXviD,
  XXXx264,
  XXXOther,
  XXXImageset,
  XXXPacks,
  Other,
  OtherMisc,
  OtherHashed,
  Books,
  BooksEbook,
  BooksComics,
  BooksMagazines,
  BooksTechnical,
  BooksOther,
  BooksForeign,
];
