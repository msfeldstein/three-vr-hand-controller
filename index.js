const EE = require('eventemitter3')
const extend = function(object, extension) {
    for (var key in extension) {
        object[key] = extension[key];
    }
}

// Since chromes gamepad list is not an actual array we need to explicitly declare find and indexOf
const find = function(list, query) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] && query(list[i])) return list[i]
  }
  return null
}

const indexOf = function(list, obj) {
  for (let i = 0; i < list.length; i++) {
    if (list[i] === obj) return i
  }
  return -1
}

module.exports = function(THREE) {
  class VRController extends THREE.Object3D {
  	// id should become: hand is string left, right, or undefined to just grab the next controller
  	constructor(standingMatrix, id) {
  		super()
  		extend(this, new EE)
  		this.standingMatrix = standingMatrix
  		this.controllerId = id
  		this.connected = false
  	}

  	findGamepad() {
  		const gamepads = navigator.getGamepads()
  		let gp = gamepads[this.controllerId]
  		if (gp) {
  			return gp
  		} else if (this.controllerId === 'left' || this.controllerId === 'right') {
  			const found = find(gamepads, gp => gp.hand === this.controllerId || gp.id.toLowerCase().indexOf(this.controllerId) != -1)
  			if (found) {
  				this.type = VRController.TypeMappings[found.id]
  				this.controllerId = indexOf(gamepads, found)
  				this.loadModel(found.hand)
  				return found
  			}
  		}
  		return null
  	}

  	loadModel(hand) {

  	}

  	update() {
  		const gp = this.findGamepad()
  		if (gp && gp.pose) {
  			this.visible = true
  			if (!this.connected) {
  				this.emit(VRController.Connected)
  			}
  			const pose = gp.pose
  			this.updatePose(gp.pose)
        console.log(gp.pose)
  			this.updateButtons(gp.buttons)
  			this.updateAxes(gp.axes)
  		} else {
  			this.visible = false
  			if (this.connected) {
  				this.emit(VRController.Disconnected)
  			}
  		}
  		this.connected = !!gp
  	}

  	updatePose(pose) {
  		if (pose.position && pose.orientation) {
  			this.tracked = true
  			this.position.fromArray( pose.position );
  			this.quaternion.fromArray( pose.orientation );
  			this.matrix.compose( this.position, this.quaternion, this.scale );
  			this.matrix.premultiply( this.standingMatrix);
  			this.matrixWorldNeedsUpdate = true;
  		}
  	}

  	updateButtons(buttons) {
  		const joypadButton = buttons[0]
  		const trigger = buttons[1]
  		const grip = buttons[2]
  		const aButton = buttons[3]
  		const bButtonOrPad = buttons[4]
  		this.setButtonValue(VRController.TriggerLevel, trigger.value)
  		this.setButtonValue(VRController.GripLevel, grip.value)
  		this.setButtonValue(VRController.ButtonAPressed, aButton.pressed)
  		this.setButtonValue(VRController.ButtonBPressed, bButtonOrPad.pressed)
  		this.bindButton(VRController.TriggerClicked, VRController.TriggerUnclicked, trigger, 'pressed')
  		this.bindButton(VRController.Gripped, VRController.Ungripped, grip, 'pressed')
  		this.bindButton(VRController.PadTouched, VRController.PadUntouched, bButtonOrPad, 'touched')
  	}

  	updateAxes(axes) {
  		this.setButtonValue(VRController.StickX, axes[0])
  		this.setButtonValue(VRController.StickY, axes[1] * -1.0) // Invert for WindowsMRType so y is up
  		this.setButtonValue(VRController.PadX, axes[2])
  		this.setButtonValue(VRController.PadY, axes[3] * -1.0) // Invert for WindowsMRType so y is up
  	}

  	setButtonValue(name, value) {
  		if (this[name] != value) {
  			this.emit(name, value)
  		}
  		this[name] = value
  	}

  	bindButton (eventOnKey, eventOffKey, button, type) {
      var propertyName = eventOnKey[0].toLowerCase() + eventOnKey.substring(1)
      var wasActive = this[propertyName]
      this[propertyName] = button[type]
      if (!wasActive && button[type]) {
        this.emit(eventOnKey)
      } else if (wasActive && !button[type]) {
        this.emit(eventOffKey)
      }
  	}
  }

  VRController.WindowsMRType = "WindowsMRType"
  VRController.OculusRiftTouchType = "OculusRiftTouchType"
  VRController.HTCViveType = "HTCViveType"

  VRController.TypeMappings = {
  	"Spatial Controller (Spatial Interaction Source)": VRController.WindowsMRType
  }

  VRController.TriggerClicked = "triggerClicked"
  VRController.TriggerUnclicked = "triggerUnclicked"
  VRController.TriggerLevel = "triggerLevel"
  VRController.Gripped = "gripped"
  VRController.Ungripped = "ungripped"
  VRController.GripLevel = "gripLevel"
  VRController.Connected = "connected"
  VRController.Disconnected = "disconnected"
  VRController.ButtonAPressed = "buttonAPressed"
  VRController.ButtonAReleased = "buttonAReleased"
  VRController.ButtonBPressed = "buttonBPressed"
  VRController.ButtonBReleased = "buttonBReleased"
  VRController.PadTouched = "padTouched"
  VRController.PadUntouched = "padUntouched"
  VRController.PadX = "padX"
  VRController.PadY = "padY"
  VRController.StickX = "stickX"
  VRController.StickY = "stickY"

  return VRController
}
