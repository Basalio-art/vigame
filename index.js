const canvasWrapper = document.querySelector('.knight-game-wrapper')
const canvas = document.querySelector('.knight-game')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: './assets/img/background.png'
})

const shop = new Sprite({
	position: {
		x: 635,
		y: 160
	},
	imageSrc: './assets/img/shop_anim.png',
	scale: 2.5,
	framesMax: 6
})

const player = new Fighter({
	position: { x: 70, y: 371 },
	velocity: { x: 0, y: 0 },
	imageSrc: './assets/img/Blue knight/IDLE.png',
	framesMax: 7,
	scale: 3,
	offset: { x: 120, y: 70 },
	sprites: {
		idle: {
			imageSrc: './assets/img/Blue knight/IDLE.png',
			framesMax: 7,
		},
		run: {
			imageSrc: './assets/img/Blue knight/RUN.png',
			framesMax: 8,
		},
		run1: {
			imageSrc: './assets/img/Blue knight/RUN 1.png',
			framesMax: 8,
		},
		jump: {
			imageSrc: './assets/img/Blue knight/JUMP.png',
			framesMax: 3
		},
		fall: {
			imageSrc: './assets/img/Blue knight/FALL.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './assets/img/Blue knight/ATTACK 1.png',
			framesMax: 6
		},
		attack2: {
			imageSrc: './assets/img/Blue knight/ATTACK 2.png',
			framesMax: 5
		},
		attack3: {
			imageSrc: './assets/img/Blue knight/ATTACK 3.png',
			framesMax: 6
		},
		hit: {
			imageSrc: './assets/img/Blue knight/HURT.png',
			framesMax: 4
		},
		death: {
			imageSrc: './assets/img/Blue knight/DEATH.png',
			framesMax: 12
		}
	},
	attackBox: {
		offset: { x: 0, y: 0 },
		width: 0,
		height: 0
	}
})

const enemy = new Fighter({
	position: { x: 900, y: 371 },
	velocity: { x: 0, y: 0 },
	imageSrc: './assets/img/Red knight/IDLE.png',
	framesMax: 7,
	scale: 3,
	offset: { x: 120, y: 70 },
	sprites: {
		idle: {
			imageSrc: './assets/img/Red knight/IDLE.png',
			framesMax: 7,
		},
		run: {
			imageSrc: './assets/img/Red knight/RUN.png',
			framesMax: 8,
		},
		run1: {
			imageSrc: './assets/img/Red knight/RUN 1.png',
			framesMax: 8,
		},
		jump: {
			imageSrc: './assets/img/Red knight/JUMP.png',
			framesMax: 3
		},
		fall: {
			imageSrc: './assets/img/Red knight/FALL.png',
			framesMax: 1
		},
		attack1: {
			imageSrc: './assets/img/Red knight/ATTACK 1.png',
			framesMax: 6
		},
		attack2: {
			imageSrc: './assets/img/Red knight/ATTACK 2.png',
			framesMax: 5
		},
		attack3: {
			imageSrc: './assets/img/Red knight/ATTACK 3.png',
			framesMax: 6
		},
		hit: {
			imageSrc: './assets/img/Red knight/HURT.png',
			framesMax: 4
		},
		death: {
			imageSrc: './assets/img/Red knight/DEATH.png',
			framesMax: 12
		}
	},
	attackBox: {
		offset: { x: 0, y: 0 },
		width: 0,
		height: 0
	}
})

const keys = {
	a: { pressed: false },
	d: { pressed: false },
	arrowright: { pressed: false },
	arrowleft: { pressed: false },
}

const AI_DISTANCE = 800;
const ATTACK_DISTANCE = 100;

const animate = () => {
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	background.update()
	shop.update()
	c.fillStyle = 'rgba(255, 255, 255, .15)'
	c.fillRect(0, 0, canvas.width, canvas.height)
	player.update()
	enemy.update()

	player.velocity.x = 0
	enemy.velocity.x = 0

	// Player movement
	if (keys.a.pressed && player.lastKey === 'a') {
		player.velocity.x = -5
		player.switchSprite('run1')
	} else if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}

	if (player.velocity.y < 0) {
		player.switchSprite('jump')
	} else if (player.velocity.y > 0) {
		player.switchSprite('fall')
	}

	// Enemy movement
	if (keys.arrowleft.pressed && enemy.lastKey === 'arrowleft') {
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	} else if (keys.arrowright.pressed && enemy.lastKey === 'arrowright') {
		enemy.velocity.x = 5
		enemy.switchSprite('run1')
	} else {
		enemy.switchSprite('idle')
	}

	if (enemy.velocity.y < 0) {
		enemy.switchSprite('jump')
	} else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	//Detect Collision
	if (
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy
		}) &&
		player.isAttacking &&
		player.framesCurrent === player.attackFrame &&
		!finalResult
	) {
		enemy.hit()
		player.isAttacking = false

		if (enemy.health < 0) {
			document.querySelector('.enemy-health div').style.width = '0%'
		} else {
			document.querySelector('.enemy-health div').style.width = enemy.health + '%'
		}

	}

	if (enemy.AI) {
		document.documentElement.style.setProperty('--enemy', "'Computer'")
	} else {
		document.documentElement.style.setProperty('--enemy', "'Player 2'")
	}

	//player miss
	if (player.isAttacking && player.framesCurrent === player.attackFrame) {
		player.isAttacking = false
	}

	if (
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player
		}) &&
		enemy.isAttacking &&
		enemy.framesCurrent === enemy.attackFrame &&
		!finalResult
	) {
		player.hit()
		enemy.isAttacking = false

		if (player.health < 0) {
			document.querySelector('.player-health div').style.width = '0%'
		} else {
			document.querySelector('.player-health div').style.width = player.health + '%'
		}
	}

	//enemy miss
	if (enemy.isAttacking && enemy.framesCurrent === enemy.attackFrame) {
		enemy.isAttacking = false
	}

	//End Game Based on Health
	if (player.health <= 0 || enemy.health <= 0) {
		determineWinner({ player, enemy, timerId })
	}

	if (enemy.AI && !enemy.dead) {
		enemyAI(enemy, player);   // Call enemy AI function
	}
}

let PAttack = false
let pAttackCount = 0
let EAttack = false
let eAttackCount = 0

const enemyAI = (enemy, player) => {
	const distance = player.position.x - enemy.position.x;
	// Move towards player
	if (Math.abs(distance) < AI_DISTANCE && !player.dead && !EAttack) {
		if (distance < 0) {
			enemy.velocity.x = -2.5; // Move left
			enemy.switchSprite('run');
			enemy.lastKey = 'arrowleft';
		} else {
			enemy.velocity.x = 2.5; // Move right
			enemy.switchSprite('run1');
			enemy.lastKey = 'arrowright';
		}
		// Attack if close enough
		if (Math.abs(distance) < ATTACK_DISTANCE && distance <= 0) {
			if (!EAttack && !enemy.takingHit) {
				eAttackCount++
				enemy.attack(eAttackCount, false)
				EAttack = true
				if (eAttackCount >= 3) {
					eAttackCount = 0
				}
				setTimeout(() => {
					EAttack = false
				}, 1000)
			}
		}
	} else {
		enemy.switchSprite('idle'); // Idle if far away
	}
	// Jump if the player is above
	if (player.position.y < enemy.position.y && enemy.isOnGround) {
		setTimeout(() => {
			enemy.jump();
		}, 200)
	}
}

animate()

const reset = () => {
	finalResult = false
	gameResult.classList.remove('appear')

	player.dead = false
	enemy.dead = false

	player.health = 100
	enemy.health = 100

	document.querySelector('.player-health div').style.width = player.health + '%'
	document.querySelector('.enemy-health div').style.width = enemy.health + '%'

	player.position.x = 70
	enemy.position.x = 900

	player.position.y = 371
	enemy.position.y = 371

	player.switchSprite('idle')
	enemy.switchSprite('idle')

	timer = 61
	clearTimeout(timerId)
	decreaseTimer()
}

reset()

document.addEventListener('keydown', (event) => {
	const key = event.key

	switch (key) {
		case 'Escape':
			event.preventDefault()
			break
		case 'F1':
			event.preventDefault()
			if (document.fullscreenElement) {
				canvas.style.width = '100%'
				canvas.style.height = '100%'
				document.exitFullscreen()
			} else {
				canvas.style.width = '100vw'
				canvas.style.height = '100vh'
				canvasWrapper.requestFullscreen()
			}
			break
		case 'F2':
			if (stop) {
				stop = false
			} else {
				stop = true
			}
			playRandomMusic()
			break
		case 'F3':
			event.preventDefault()
			reset()
			break
	}

	if (!player.dead && !player.AI) {
		// Player controls
		switch (key) {
			case 'd':
			case 'D':
				keys.d.pressed = true
				player.lastKey = 'd'
				break
			case 'a':
			case 'A':
				keys.a.pressed = true
				player.lastKey = 'a'
				break
			case 'w':
			case 'W':
				player.jump()
				break
			case ' ':
			case 's':
			case 'S':
				if (!PAttack && !player.takingHit) {
					pAttackCount++
					player.attack(pAttackCount, true)
					PAttack = true
					if (pAttackCount >= 3) {
						pAttackCount = 0
					}
					setTimeout(() => {
						PAttack = false
					}, 500)
				}
				break
		}
	}

	if (!enemy.dead && !enemy.AI) {
		// Enemy Controls
		switch (key) {
			case 'ArrowRight':
				keys.arrowright.pressed = true
				enemy.lastKey = 'arrowright'
				break
			case 'ArrowLeft':
				keys.arrowleft.pressed = true
				enemy.lastKey = 'arrowleft'
				break
			case 'ArrowUp':
				enemy.jump()
				break
			case '/':
			case '?':
			case 'ArrowDown':
				if (!EAttack && !enemy.takingHit) {
					eAttackCount++
					enemy.attack(eAttackCount, false)
					EAttack = true
					if (eAttackCount >= 3) {
						eAttackCount = 0
					}
					setTimeout(() => {
						EAttack = false
					}, 500)
				}
				break
		}
	}
})

document.addEventListener('keyup', (event) => {
	const key = event.key

	switch (key) {
		case 'd':
		case 'D':
			runAudio.pause()
			keys.d.pressed = false
			break
		case 'a':
		case 'A':
			runAudio.pause()
			keys.a.pressed = false
			break
		case 'ArrowRight':
			runAudio.pause()
			keys.arrowright.pressed = false
			break
		case 'ArrowLeft':
			runAudio.pause()
			keys.arrowleft.pressed = false
			break
	}
})

let cursorTimout

canvasWrapper.addEventListener('mousemove', () => {
	canvasWrapper.style.cursor = 'default'
	clearTimeout(cursorTimout)
	cursorTimout = setTimeout(() => {
		canvasWrapper.style.cursor = 'none'
	}, 1000)
})

document.addEventListener('fullscreenchange', () => {
	if (!document.fullscreenElement) {
		canvas.style.width = '100%'
		canvas.style.height = '100%'
	}
})

