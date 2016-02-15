jammin.factory('MetronomeFactory', ['SocketFactory', function(SocketFactory) {
  var metronomeFactory = {};

  //HATS

  //filtering the hi-hats a bit
  //to make them sound nicer
  var lowPass = new Tone.Filter({
      "frequency": 14000,
  }).toMaster();

  //we can make our own hi hats with
  //the noise synth and a sharp filter envelope
  var openHiHat = new Tone.NoiseSynth({
    "volume" : -10,
      "filter": {
          "Q": 1
      },
      "envelope": {
          "attack": 0.01,
          "decay": 0.3
      },
      "filterEnvelope": {
          "attack": 0.01,
          "decay": 0.03,
          "baseFrequency": 4000,
          "octaves": -2.5,
          "exponent": 4,
      }
  }).connect(lowPass);

  var openHiHatPart = new Tone.Part(function(time){
    openHiHat.triggerAttack(time);
  }, ["2*8n", "6*8n"]).start(0);

  var closedHiHat = new Tone.NoiseSynth({
    "volume" : -10,
      "filter": {
          "Q": 1
      },
      "envelope": {
          "attack": 0.01,
          "decay": 0.15
      },
      "filterEnvelope": {
          "attack": 0.01,
          "decay": 0.03,
          "baseFrequency": 4000,
          "octaves": -2.5,
          "exponent": 4,

      }
  }).connect(lowPass);

  var closedHatPart = new Tone.Part(function(time){
    closedHiHat.triggerAttack(time);
  }, ["0*8n", "1*16n", "1*8n", "3*8n", "4*8n", "5*8n", "7*8n", "8*8n"]).start(0);

  //BASS
  var bassEnvelope = new Tone.AmplitudeEnvelope({
      "attack": 0.01,
      "decay": 0.2,
      "sustain": 0,
      "release": 0,
  }).toMaster();

  var bassFilter = new Tone.Filter({
      "frequency": 600,
      "Q": 8
  });

  var bass = new Tone.PulseOscillator("A2", 0.4).chain(bassFilter, bassEnvelope);
  bass.start();

  var bassPart = new Tone.Part(function(time, note){
    bass.frequency.setValueAtTime(note, time);
      bassEnvelope.triggerAttack(time);
  }, [["0:0", "A1"],
    ["0:2", "G1"],
    ["0:2:2", "C2"],
    ["0:3:2", "A1"]]).start(0);

  //BLEEP
  var bleepEnvelope = new Tone.AmplitudeEnvelope({
      "attack": 0.01,
      "decay": 0.4,
      "sustain": 0,
      "release": 0,
  }).toMaster();


  var bleep = new Tone.Oscillator("A4").connect(bleepEnvelope);
  bleep.start();

  var bleepLoop = new Tone.Loop(function(time){
     bleepEnvelope.triggerAttack(time);
  }, "2n").start(0);


  //KICK
  var kickEnvelope = new Tone.AmplitudeEnvelope({
      "attack": 0.01,
      "decay": 0.2,
      "sustain": 0,
      "release": 0
  }).toMaster();

  var kick = new Tone.Oscillator("A2").connect(kickEnvelope).start();

  var kickSnapEnv = new Tone.FrequencyEnvelope({
      "attack": 0.005,
      "decay": 0.01,
      "sustain": 0,
      "release": 0,
      "baseFrequency": "A2",
      "octaves": 2.7
  }).connect(kick.frequency);

  var kickPart = new Tone.Part(function(time){
  	kickEnvelope.triggerAttack(time);
  	kickSnapEnv.triggerAttack(time);
  }, ["0", "0:0:3", "0:3:0"]).start(0);

  //TRANSPORT
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = "1:0";
  Tone.Transport.loop = true;

  Tone.Transport.bpm.value = 120;

  var syncTransport = new Tone.Part(function(time){
    SocketFactory.emit('sync');
    console.log('sync message from client');
  }, ["0"]).start(0);

  metronomeFactory.startTransport = function() {
    Tone.Transport.start();
  }

  metronomeFactory.stopTransport = function() {
    Tone.Transport.stop();
  }

  metronomeFactory.unmute = function() {
    kickPart.mute = false;
    bassPart.mute = false;
    closedHatPart.mute = false;
  }

  metronomeFactory.mute = function() {
    kickPart.mute = true;
    bassPart.mute = true;
    closedHatPart.mute = true;
  }

  metronomeFactory.toggleMetronome = function(metronomeStatus) {
    if (metronomeStatus === 'off'){
      metronomeFactory.unmute();
      return 'on';
    } else {
      metronomeFactory.mute();
      return 'off';
    }
  }

  return metronomeFactory;
}]);
