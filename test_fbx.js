import fs from 'fs';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Node.js doesn't have XMLHttpRequest out of the box, which FBXLoader uses.
// Let's just do a simpler search in the FBX file.
