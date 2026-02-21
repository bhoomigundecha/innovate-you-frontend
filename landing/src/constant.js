// conatains the details of the world 

// Avatar URLs per world type
const AVATAR_HOME  = "https://models.readyplayer.me/699894f12de3dcd9837d5ebf.glb";
const AVATAR_FOOTBALL = "https://models.readyplayer.me/699896002b9bcc76d5ea941c.glb";
const AVATAR_NATURE= "https://models.readyplayer.me/699894784d98c7682174aa5a.glb";
const AVATAR_DEFAULT = "https://models.readyplayer.me/699894f12de3dcd9837d5ebf.glb";

export const WORLDS_CONFIG = {
  home: {
    // home par we could use avatar4.glb
    id: "home",
    label: "The Home",
    exr: "/assets/avatar_bg/home.exr",
    // No `ground` — this is an indoor scene; the floor is already in the panorama
    cameraPosition: [0, 1.0, 0],
    cameraFov: 50,
    avatarUrl: AVATAR_HOME,
  },
  city_walk: {
    // city walk pr avatar3 
    id: "city_walk",
    label: "The City Walk",
    exr: "/assets/avatar_bg/city_walk.exr",
    ground: { height: 15, radius: 60, scale: 30 },
    cameraPosition: [0, 1.0, 0],
    cameraFov: 50,
    avatarUrl: AVATAR_CITY,
  },
  football_court: {

    id: "football_court",
    label: "The Football Court",
    exr: "/assets/avatar_bg/football_court.exr",
    ground: { height: 5, radius: 40, scale: 25 },
    cameraPosition: [0, 1.0, 0],
    cameraFov: 50,
    avatarUrl: AVATAR_FOOTBALL,
  },
  nature_walk: {
    // nature walk pr avatar 5 
    id: "nature_walk",
    label: "The Nature Walk",
    exr: "/assets/avatar_bg/nature_walk.exr",
    ground: { height: 10, radius: 50, scale: 25 },
    cameraPosition: [0, 1.0, 0],
    cameraFov: 50,
    avatarUrl: AVATAR_NATURE,
  },
};
