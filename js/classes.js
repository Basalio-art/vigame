class Sprite {
	constructor({
		position,
		imageSrc,
		scale = 1,
		framesMax = 1,
		offset = { x: 0, y: 0 },
	}) {
		this.position = position
		this.height = 150
		this.width = 50
		this.image = new Image()
		this.image.src = imageSrc
		this.scale = scale
		this.framesMax = framesMax
		this.framesCurrent = 0
		this.framesElapsed = 0
		this.framesHold = 5
		this.offset = offset
	}

	draw() {
		c.drawImage(
			this.image,
			this.framesCurrent * (this.image.width / this.framesMax),
			0,
			this.image.width / this.framesMax,
			this.image.height,
			this.position.x - this.offset.x,
			this.position.y - this.offset.y,
			(this.image.width / this.framesMax) * this.scale,
			this.image.height * this.scale
		)
	}

	animateFrames() {
		this.framesElapsed++

		if (this.framesElapsed % this.framesHold === 0) {
			this.framesCurrent = (this.framesCurrent + 1) % this.framesMax
		}
	}

	update() {
		this.draw()
		this.animateFrames()
	}
}

const audioAtk1 = new Audio("./assets/audio/attack1.mp3")
const audioAtk2 = new Audio("./assets/audio/attack2.mp3")
const audioAtk3 = new Audio("./assets/audio/attack3.mp3")
const audioDeath1 = new Audio("./assets/audio/death1.mp3")
const audioDeath2 = new Audio("./assets/audio/death2.mp3")
const audioDeath3 = new Audio("./assets/audio/death3.mp3")

const music1 = new Audio("./assets/audio/music (1).mp3")
const music2 = new Audio("./assets/audio/music (2).mp3")
const music3 = new Audio("./assets/audio/music (3).mp3")
const music4 = new Audio("./assets/audio/music (4).mp3")

const jumpAudio = new Audio("./assets/audio/jump.mp3")

const runAudio = new Audio("./assets/audio/run.mp3")
runAudio.loop = true
runAudio.volume = 0.8

const musicArray = [music1, music2, music3, music4]
let stop = false

const playRandomMusic = () => {
	musicArray.forEach((audio) => audio.pause())
	const playMusicIndex = Math.floor(Math.random() * musicArray.length)
	const selectedMusic = musicArray[playMusicIndex]

	if (selectedMusic && !stop) {
		selectedMusic.currentTime = 0
		selectedMusic.play().catch((error) => {
			console.error("Error playing music:", error)
			const playOnClick = () => {
				selectedMusic
					.play()
					.catch((e) =>
						console.error("Error playing music on interaction:", e)
					)
				document.removeEventListener("keydown", playOnClick)
				document.removeEventListener("click", playOnClick)
			}
			document.addEventListener("keydown", playOnClick, { once: true })
			document.addEventListener("click", playOnClick, { once: true })
		})
	}

	if (stop) {
		selectedMusic.pause()
	}
}

musicArray.forEach((audioElem) => {
	audioElem.addEventListener("ended", () => {
		playRandomMusic()
	})
})

playRandomMusic()

let damage = 0

class Fighter extends Sprite {
	constructor({
		position,
		velocity,
		color,
		imageSrc,
		scale = 1,
		framesMax = 1,
		offset = { x: 0, y: 0 },
		sprites,
		attackBox = { offset: {}, width: undefined, height: undefined },
	}) {
		super({
			position,
			imageSrc,
			scale,
			framesMax,
			offset,
		})

		this.velocity = velocity
		this.width = 50
		this.height = 110
		this.lastKey
		this.isOnGround = false
		this.jumpCounter = 0
		this.attackBox = {
			position: {
				x: this.position.x,
				y: this.position.y,
			},
			offset: attackBox.offset,
			width: attackBox.width,
			height: attackBox.height,
		}
		this.color = color
		this.isAttacking = false
		this.health = this.health
		this.sprites = sprites
		this.dead = false
		this.takingHit = false
		this.attackFrame = 0
		this.AI = false
		this.onLocation = false

		for (const spriteName in this.sprites) {
			if (this.sprites.hasOwnProperty(spriteName)) {
				this.sprites[spriteName].image = new Image()
				this.sprites[spriteName].image.src =
					this.sprites[spriteName].imageSrc
			}
		}
	}

	update() {
		this.draw()
		if (
			!this.dead ||
			(this.image === this.sprites.death.image &&
				this.framesCurrent < this.sprites.death.framesMax - 1)
		) {
			this.animateFrames()
		}

		// c.fillStyle = 'rgba(255, 0, 0, .5)'
		// c.fillRect(
		// 	this.attackBox.position.x,
		// 	this.attackBox.position.y,
		// 	this.attackBox.width,
		// 	this.attackBox.height
		// )

		// c.fillStyle = 'rgba(0, 255, 0, .5)'
		// c.fillRect(
		// 	this.position.x,
		// 	this.position.y,
		// 	this.width,
		// 	this.height
		// )


		if (
			this.image === this.sprites.death.image &&
			this.framesCurrent === this.sprites.death.framesMax - 1 &&
			!this.dead
		) {
			this.dead = true
		}

		this.attackBox.position.x = this.position.x + this.attackBox.offset.x
		this.attackBox.position.y = this.position.y + this.attackBox.offset.y

		this.position.x += this.velocity.x
		this.position.y += this.velocity.y

		if (
			this.position.y + this.height + this.velocity.y >=
			canvas.height - 95
		) {
			this.velocity.y = 0
			this.position.y = 371
			if (!this.isOnGround) {
				this.jumpCounter = 0
				this.isOnGround = true
			}
		} else {
			this.velocity.y += gravity
			this.isOnGround = false
		}

		if (this.position.x <= 0) {
			this.position.x = 0
		} else if (this.position.x + this.width >= canvas.width) {
			this.position.x = canvas.width - this.width
		}
	}
	
	jump() {
		if (this.jumpCounter < 2 && !this.dead) {
			runAudio.pause()
			jumpAudio
				.play()
				.catch((e) => console.error("Error playing jump audio:", e))
			this.velocity.y = -14
			this.jumpCounter++
			this.isOnGround = false
		}
	}

	attack(attackType, isPlayerCharacter) {
		if (this.dead || this.takingHit) return
		this.isAttacking = true
		this.switchSprite("attack" + attackType)

		switch (attackType) {
			case 1:
				damage = 6.6
				this.attackBox.width = 150
				this.attackBox.height = 40
				this.attackBox.offset.y = 50
				this.attackFrame = 3

				if (isPlayerCharacter) {
					this.attackBox.offset.x =
						this.lastKey === "a" ? -48 : -48
				} else {
					this.attackBox.offset.x =
						this.lastKey === "arrowright" ? -55 : -55
				}
				audioAtk1
					.play()
					.catch((e) =>
						console.error("Error playing attack1 audio:", e)
					)
				break
			case 2:
				damage = 3.3
				this.attackBox.width = 145
				this.attackBox.height = 40
				this.attackBox.offset.y = 70
				this.attackFrame = 1

				if (isPlayerCharacter) {
					this.attackBox.offset.x =
						this.lastKey === "a" ? -45 : -45
				} else {
					this.attackBox.offset.x =
						this.lastKey === "arrowright" ? -52 : -52
				}
				audioAtk2
					.play()
					.catch((e) =>
						console.error("Error playing attack2 audio:", e)
					)
				break
			case 3:
				damage = 9.9
				this.attackBox.width = 40
				this.attackBox.height = 100
				this.attackBox.offset.y = 5
				this.attackFrame = 2

				if (isPlayerCharacter) {
					this.attackBox.offset.x =
						this.lastKey === "a" ? 75 : 75
				} else {
					this.attackBox.offset.x =
						this.lastKey === "arrowright" ? -67 : -67
				}
				audioAtk3
					.play()
					.catch((e) =>
						console.error("Error playing attack3 audio:", e)
					)
				break
		}
	}

	hit() {
		if (this.dead) return

		this.health -= damage
		this.isAttacking = false

		if (this.health <= 0) {
			this.health = 0
					this.switchSprite("death")
		} else {
			this.switchSprite("hit")
		}
	}

	switchSprite(spriteKey) {
		if (this.image === this.sprites.death.image && this.health <= 0) {
			if (this.framesCurrent === this.sprites.death.framesMax - 1)
				this.dead = true
			return
		}
		if (spriteKey === "death") {
			if (this.image !== this.sprites.death.image) {
				this.image = this.sprites.death.image
				this.framesMax = this.sprites.death.framesMax
				this.framesCurrent = 0
				const deadAudio = Math.floor(Math.random() * 3) + 1
				switch (deadAudio) {
					case 1:
						audioDeath1
							.play()
							.catch((e) =>
								console.error("Error playing death1 audio:", e)
							)
						break
					case 2:
						audioDeath2
							.play()
							.catch((e) =>
								console.error("Error playing death2 audio:", e)
							)
						break
					case 3:
						audioDeath3
							.play()
							.catch((e) =>
								console.error("Error playing death3 audio:", e)
							)
						break
				}
			}
			return
		}

		if (
			this.image === this.sprites.hit.image &&
			this.framesCurrent < this.sprites.hit.framesMax - 1
		) {
			return
		}
		if (spriteKey === "hit") {
			if (this.image !== this.sprites.hit.image) {
				this.image = this.sprites.hit.image
				this.framesMax = this.sprites.hit.framesMax
				this.framesCurrent = 0
				this.takingHit = true
				const hitDuration =
					(this.sprites.hit.framesMax * this.framesHold * 1000) / 60
				setTimeout(() => {
					this.takingHit = false
				}, hitDuration)
			}
			return
		}

		if (
			(this.image === this.sprites.attack1.image &&
				this.framesCurrent < this.sprites.attack1.framesMax - 1) ||
			(this.image === this.sprites.attack2.image &&
				this.framesCurrent < this.sprites.attack2.framesMax - 1) ||
			(this.image === this.sprites.attack3.image &&
				this.framesCurrent < this.sprites.attack3.framesMax - 1)
		) {
			if (
				spriteKey !== "attack1" &&
				spriteKey !== "attack2" &&
				spriteKey !== "attack3"
			) {
				return
			}
		}

		switch (spriteKey) {
			case "idle":
				if (this.image !== this.sprites.idle.image || this.dead === true) {
					this.image = this.sprites.idle.image
					this.framesMax = this.sprites.idle.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
			case "run":
				if (this.image !== this.sprites.run.image) {
					this.image = this.sprites.run.image
					this.framesMax = this.sprites.run.framesMax
					this.framesCurrent = 0
				}
				if (runAudio.paused)
					runAudio
						.play()
						
						
				break
			case "run1":
				if (this.image !== this.sprites.run1.image) {
					this.image = this.sprites.run1.image
					this.framesMax = this.sprites.run1.framesMax
					this.framesCurrent = 0
				}
				if (runAudio.paused)
					runAudio
						.play()
						.catch((e) =>
							console.error("Error playing run audio:", e)
						)
				break
			case "jump":
				if (this.image !== this.sprites.jump.image) {
					this.image = this.sprites.jump.image
					this.framesMax = this.sprites.jump.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
			case "fall":
				if (this.image !== this.sprites.fall.image) {
					this.image = this.sprites.fall.image
					this.framesMax = this.sprites.fall.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
			case "attack1":
				if (this.image !== this.sprites.attack1.image) {
					this.image = this.sprites.attack1.image
					this.framesMax = this.sprites.attack1.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
			case "attack2":
				if (this.image !== this.sprites.attack2.image) {
					this.image = this.sprites.attack2.image
					this.framesMax = this.sprites.attack2.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
			case "attack3":
				if (this.image !== this.sprites.attack3.image) {
					this.image = this.sprites.attack3.image
					this.framesMax = this.sprites.attack3.framesMax
					this.framesCurrent = 0
				}
				runAudio.pause()
				break
		}
	}
}
