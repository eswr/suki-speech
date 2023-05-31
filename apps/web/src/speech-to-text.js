const speech = require("@google-cloud/speech");

// Instantiates a client
const client = new speech.SpeechClient();

// The path to the remote LINEAR16 file
const gcsUri = "gs://cloud-samples-data/speech/brooklyn_bridge.raw";

async function transcribeSpeech() {
  const audio = {
    uri: gcsUri,
  };

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const config = {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  };

  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");
  console.log(`Transcription: ${transcription}`);
}
