# Character asset notes

The sprite atlases and mapping data in this folder were supplied by Enrique in `Enrique_Platformer_Sprites_81_Frames.zip`. The archive README describes 81 transparent 256×256 frames in a 9×9 atlas, with 26 named animation sequences. The atlas preview and source metadata are preserved here.

The game uses these frames as a 2D sprite plane in a Three.js side-on 3D scene. Keep the alpha channel intact and use the independent gameplay collision dimensions rather than deriving physics from transparent image bounds. The user's source README says the frames were extracted from reference illustrations and recommends inspecting edges before commercial use; review those edges and confirm the intended redistribution/commercial rights before release.
