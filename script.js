// Game state
let gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    score: 0,
    timer: 60,
    timerInterval: null,
    gameActive: false,
    selectedCategory: '',
    totalPairs: 8
  };
  
  // Card data for each category
  const cardData = {
    fruits: [
      '🍎', '🍌', '🍇', '🍊', '🍓', '🍍', '🥭', '🍑',
      '🍎', '🍌', '🍇', '🍊', '🍓', '🍍', '🥭', '🍑'
    ],
    emojis: [
      '😀', '😍', '🤔', '😎', '🥳', '😴', '🤯', '🥶',
      '😀', '😍', '🤔', '😎', '🥳', '😴', '🤯', '🥶'
    ],
    animals: [
      '🐶', '🐱', '🐭', '🦊', '🐻', '🐼', '🐨', '🦁',
      '🐶', '🐱', '🐭', '🦊', '🐻', '🐼', '🐨', '🦁'
    ],
    planets: [
      '🌎', '🪐', '☀️', '🌙', '⭐', '☄️', '🌟', '🌌',
      '🌎', '🪐', '☀️', '🌙', '⭐', '☄️', '🌟', '🌌'
    ],
    flags: [
      '🇺🇸', '🇬🇧', '🇯🇵', '🇨🇦', '🇧🇷', '🇮🇳', '🇫🇷', '🇩🇪',
      '🇺🇸', '🇬🇧', '🇯🇵', '🇨🇦', '🇧🇷', '🇮🇳', '🇫🇷', '🇩🇪'
    ]
  };
  
  // Sound effects
  const sounds = {
    flip: new Audio('https://assets.mixkit.co/active_storage/sfx/2073/2073-preview.mp3'),
    match: new Audio('https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/1010/1010-preview.mp3'),
    gameOver: new Audio('https://assets.mixkit.co/active_storage/sfx/254/254-preview.mp3')
  };
  
  // Adjust sound volumes
  sounds.flip.volume = 0.3;
  sounds.match.volume = 0.4;
  sounds.win.volume = 0.5;
  sounds.gameOver.volume = 0.5;
  
  // DOM Elements
  const landingPage = document.getElementById('landing-page');
  const gameBoard = document.getElementById('game-board');
  const cardsContainer = document.getElementById('cards-container');
  const scoreElement = document.getElementById('score');
  const timerElement = document.getElementById('timer');
  const gameMessage = document.getElementById('game-message');
  const messageTitle = document.getElementById('message-title');
  const messageText = document.getElementById('message-text');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const restartBtn = document.getElementById('restart-btn');
  const homeBtn = document.getElementById('home-btn');
  const playAgainBtn = document.getElementById('play-again-btn');
  
  // Initialize the game
  function init() {
    // Add event listeners
    categoryButtons.forEach(button => {
      button.addEventListener('click', () => {
        gameState.selectedCategory = button.dataset.category;
        startGame();
      });
    });
  
    restartBtn.addEventListener('click', restartGame);
    homeBtn.addEventListener('click', goToHome);
    playAgainBtn.addEventListener('click', restartGame);
  
    // Load saved game if exists
    loadGameState();
  }
  
  // Start the game
  function startGame() {
    // Hide landing page and show game board
    landingPage.classList.add('hidden');
    gameBoard.classList.remove('hidden');
    gameMessage.classList.add('hidden');
  
    // Reset game state
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.score = 0;
    gameState.timer = 60;
    gameState.gameActive = true;
  
    // Update UI
    scoreElement.textContent = gameState.score;
    timerElement.textContent = gameState.timer;
  
    // Create and shuffle cards
    createCards();
  
    // Start timer
    startTimer();
  
    // Save game state
    saveGameState();
  }
  
  // Create and shuffle cards
  function createCards() {
    // Clear cards container
    cardsContainer.innerHTML = '';
  
    // Get cards for selected category and shuffle them
    const cards = [...cardData[gameState.selectedCategory]];
    shuffleArray(cards);
  
    // Create card elements
    cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.dataset.index = index;
      cardElement.dataset.value = card;
  
      cardElement.innerHTML = `
        <div class="card-face card-front">?</div>
        <div class="card-face card-back">${card}</div>
      `;
  
      cardElement.addEventListener('click', () => handleCardClick(cardElement));
      cardsContainer.appendChild(cardElement);
      gameState.cards.push({
        element: cardElement,
        value: card,
        isFlipped: false,
        isMatched: false
      });
    });
  }
  
  // Handle card click
  function handleCardClick(cardElement) {
    const index = parseInt(cardElement.dataset.index);
    const card = gameState.cards[index];
  
    // Ignore if game is not active, card is already flipped or matched, or two cards are already flipped
    if (!gameState.gameActive || card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) {
      return;
    }
  
    // Flip the card
    flipCard(card, true);
    sounds.flip.play();
  
    // Add to flipped cards
    gameState.flippedCards.push(card);
  
    // If two cards are flipped, check for a match
    if (gameState.flippedCards.length === 2) {
      checkForMatch();
    }
  }
  
  // Flip a card
  function flipCard(card, isFlipped) {
    card.isFlipped = isFlipped;
    if (isFlipped) {
      card.element.classList.add('flipped');
    } else {
      card.element.classList.remove('flipped');
    }
  }
  
  // Check for a match
  function checkForMatch() {
    const [card1, card2] = gameState.flippedCards;
  
    if (card1.value === card2.value) {
      // Match found
      setTimeout(() => {
        card1.element.classList.add('matched');
        card2.element.classList.add('matched');
        card1.isMatched = true;
        card2.isMatched = true;
        sounds.match.play();
  
        // Update score and matched pairs
        gameState.score += 10;
        gameState.matchedPairs++;
        scoreElement.textContent = gameState.score;
  
        // Check for win
        if (gameState.matchedPairs === gameState.totalPairs) {
          endGame(true);
        }
  
        // Reset flipped cards
        gameState.flippedCards = [];
  
        // Save game state
        saveGameState();
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        flipCard(card1, false);
        flipCard(card2, false);
        gameState.flippedCards = [];
      }, 1000);
    }
  }
  
  // Start timer
  function startTimer() {
    // Clear existing timer
    if (gameState.timerInterval) {
      clearInterval(gameState.timerInterval);
    }
  
    // Start new timer
    gameState.timerInterval = setInterval(() => {
      gameState.timer--;
      timerElement.textContent = gameState.timer;
  
      // Save game state
      saveGameState();
  
      // Check for game over
      if (gameState.timer <= 0) {
        endGame(false);
      }
  
      // Change timer color when low
      if (gameState.timer <= 10) {
        timerElement.style.color = '#ff6b6b';
      } else {
        timerElement.style.color = '#6a11cb';
      }
    }, 1000);
  }
  
  // End game
  function endGame(isWin) {
    // Stop timer
    clearInterval(gameState.timerInterval);
    gameState.gameActive = false;
  
    // Show game message
    gameMessage.classList.remove('hidden');
    
    if (isWin) {
      // Win
      messageTitle.textContent = 'Congratulations!';
      messageText.textContent = `You won with a score of ${gameState.score}!`;
      sounds.win.play();
      
      // Add time bonus
      const timeBonus = gameState.timer * 2;
      gameState.score += timeBonus;
      setTimeout(() => {
        messageText.textContent = `You won with a score of ${gameState.score}! (Time Bonus: +${timeBonus})`;
      }, 1000);
    } else {
      // Game over
      messageTitle.textContent = 'Game Over';
      messageText.textContent = `Your score: ${gameState.score}`;
      sounds.gameOver.play();
    }
  
    // Clear saved game
    localStorage.removeItem('memoryMatchGameState');
  }
  
  // Restart game
  function restartGame() {
    clearInterval(gameState.timerInterval);
    startGame();
  }
  
  // Go to home
  function goToHome() {
    clearInterval(gameState.timerInterval);
    gameBoard.classList.add('hidden');
    landingPage.classList.remove('hidden');
    gameMessage.classList.add('hidden');
    
    // Clear saved game
    localStorage.removeItem('memoryMatchGameState');
  }
  
  // Save game state to localStorage
  function saveGameState() {
    // Only save if game is active
    if (!gameState.gameActive) return;
  
    const saveData = {
      selectedCategory: gameState.selectedCategory,
      score: gameState.score,
      timer: gameState.timer,
      matchedPairs: gameState.matchedPairs,
      cards: gameState.cards.map(card => ({
        value: card.value,
        isFlipped: card.isFlipped,
        isMatched: card.isMatched,
        index: parseInt(card.element.dataset.index)
      }))
    };
  
    localStorage.setItem('memoryMatchGameState', JSON.stringify(saveData));
  }
  
  // Load game state from localStorage
  function loadGameState() {
    const savedState = localStorage.getItem('memoryMatchGameState');
    
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Ask user if they want to continue
        if (confirm('Would you like to continue your previous game?')) {
          // Set game state
          gameState.selectedCategory = parsedState.selectedCategory;
          gameState.score = parsedState.score;
          gameState.timer = parsedState.timer;
          gameState.matchedPairs = parsedState.matchedPairs;
          
          // Start game
          startGame();
          
          // Restore card states
          setTimeout(() => {
            parsedState.cards.forEach(savedCard => {
              const card = gameState.cards[savedCard.index];
              
              if (savedCard.isMatched) {
                card.isMatched = true;
                card.element.classList.add('matched');
                card.element.classList.add('flipped');
              } else if (savedCard.isFlipped) {
                flipCard(card, true);
                gameState.flippedCards.push(card);
              }
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
        localStorage.removeItem('memoryMatchGameState');
      }
    }
  }
  
  // Utility function to shuffle an array
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  // Initialize the game when the DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
