# three-vr-hand-controller

Wraps the gamepad api to make a THREE.Object3D based hand controller with proper attribute names and event callbacks

### Installation

`npm install --save three-vr-hand-controller`

### Instantiation

Controls can be instantiated by hand name or controller id
```
const VRController = require('three-vr-hand-controller')(THREE)

const controller = new VRController(renderer.vr.getStandingMatrix(), 'left')
const controller2 = new VRController(renderer.vr.getStandingMatrix(), 'right')

or

const controller = new VRController(renderer.vr.getStandingMatrix(), 0)
const controller2 = new VRController(renderer.vr.getStandingMatrix(), 1)
```

### Controller State
State can be queried by attribute name or by listening for value changes

#### Querying
`console.log("Trigger level: ", controller.triggerLevel)`

`console.log("Gripped: ", controller.gripped)`

#### Event callbacks:

```
controller.on(VRController.TriggerClicked, _ => {
 	console.log("Triggered")
})

controller.on(VRController.TriggerUnclicked, _ => {
	console.log("Untriggered")
})

controller.on(VRController.PadX, padX => {
	console.log("Pad X Changed", padX)
})


Connected
Disconnected
Gripped
Ungripped
PadTouched
PadUntouched
PadX/PadY when touching the pad position changes
StickX/StickY when moving the joystick

Check values

const triggerLevel = controller.triggerLevel // float 0.0-1.0
controller.stickX // float -1.0 left to +1.0 right
controller.stickY // float -1.0 Down to +1.0 up
controller.padX // float -1.0 left to +1.0 right
controller.padY // float -1.0 down to +1.0 up
```
