# Loss scream audio

- `enrique-lose-scream-source.ogg` is the original Opus voice clip Enrique supplied in chat.
- `enrique-lose-scream.ogg` is the preferred runtime copy; `enrique-lose-scream.mp3` is the compatibility fallback.
- Both runtime copies are normalized for mobile playback with FFmpeg's `ebur128` loudness target around -18 LUFS. The measured outputs are -17.9 LUFS / -8.4 dBFS peak (Ogg) and -18.4 LUFS / -9.1 dBFS peak (MP3).
- The browser selects Ogg Opus when supported and MP3 otherwise. The cue does not download on the landing page; it is primed on the first user-initiated game start and plays once when a run ends in a loss.
