const rectangularCollision = ({ rectangle1, rectangle2 }) => {
  return (
    rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
    rectangle1.attackBox.position.x <= rectangle2.position.x + enemy.width &&
    rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
    rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
  )
}

let finalResult = false

const determineWinner = ({ player, enemy, timerId }) => {
  clearTimeout(timerId)
  
  if (!finalResult) {
    setTimeout(() => {
      gameResult.classList.add('appear')
    if (player.health === enemy.health) {
      gameResult.innerHTML = 'Tie'
    } else if (player.health > enemy.health) {
      gameResult.innerHTML = 'Blue Knight Win'
    } else if (player.health < enemy.health) {
      gameResult.innerHTML = 'Red Knight Win'
    }
    }, 1000)
    
    finalResult = true
  }
}

let timerId
const gameResult = document.querySelector('.game-result')

const decreaseTimer = () => {
  timerId = setTimeout(decreaseTimer, 1000)
  if (timer > 0) {
    timer--
    document.querySelector('.time').innerHTML = timer
  }

  if (timer === 0) {
    determineWinner({ player, enemy, timerId })
  }
}