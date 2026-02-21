// conatains the details of the world 

// Avatar URLs per world type
const AVATAR_HOME  = "/avatar.glb";
const AVATAR_FOOTBALL = "/avatar2.glb";
const AVATAR_NATURE= "/avatar3.glb";
const AVATAR_DEFAULT = "/avatar4.glb";

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
    avatarUrl: AVATAR_DEFAULT,
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
