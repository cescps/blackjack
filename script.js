document.addEventListener('DOMContentLoaded', () => {
    // Carousel Logic
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    document.getElementById('next').addEventListener('click', () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % totalSlides;
        slides[currentSlide].classList.add('active');
    });

    document.getElementById('prev').addEventListener('click', () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        slides[currentSlide].classList.add('active');
    });

    document.getElementById('start-game').addEventListener('click', () => {
        document.querySelector('.carousel-container').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        startGame();
    });

    // Blackjack Game Logic with Betting
    function startGame() {
        // Game variables
        let balance = 1000; // Player starts with $1000
        let betAmount = 0;
        let deck = [];
        let playerHand = [];
        let dealerHand = [];
        let opponents = [];
        const numOpponents = 2; // Number of opponents
        let gameOver = false;

        // Update balance display
        const balanceSpan = document.getElementById('balance');
        balanceSpan.textContent = balance;

        // Betting elements
        const bettingArea = document.getElementById('betting-area');
        const betAmountInput = document.getElementById('bet-amount');
        const placeBetButton = document.getElementById('place-bet');

        // Hide player area until bet is placed
        const playerArea = document.getElementById('player-area');
        playerArea.style.display = 'none';

        // Place Bet
        placeBetButton.addEventListener('click', () => {
            betAmount = parseInt(betAmountInput.value);
            if (isNaN(betAmount) || betAmount > balance || betAmount <= 0) {
                alert('Invalid bet amount.');
                return;
            }
            balance -= betAmount;
            balanceSpan.textContent = balance;
            bettingArea.style.display = 'none';
            playerArea.style.display = 'block';
            initializeGame();
        });

        // Initialize game after bet is placed
        function initializeGame() {
            gameOver = false;
            document.getElementById('message').textContent = '';
            document.getElementById('player-controls').style.display = 'block';
            createDeck();
            dealInitialHands();
            renderHands();
        }

        // Create and shuffle deck
        function createDeck() {
            const suits = ['♠', '♥', '♦', '♣'];
            const ranks = [
                { rank: '2', value: 2 },
                { rank: '3', value: 3 },
                { rank: '4', value: 4 },
                { rank: '5', value: 5 },
                { rank: '6', value: 6 },
                { rank: '7', value: 7 },
                { rank: '8', value: 8 },
                { rank: '9', value: 9 },
                { rank: '10', value: 10 },
                { rank: 'J', value: 10 },
                { rank: 'Q', value: 10 },
                { rank: 'K', value: 10 },
                { rank: 'A', value: 11 } // Aces can be 1 or 11
            ];
            deck = [];
            suits.forEach(suit => {
                ranks.forEach(rank => {
                    deck.push({ suit: suit, rank: rank.rank, value: rank.value });
                });
            });
            deck.sort(() => Math.random() - 0.5); // Shuffle deck
        }

        // Deal initial hands
        function dealInitialHands() {
            playerHand = [drawCard(), drawCard()];
            dealerHand = [drawCard(), drawCard()];
            opponents = [];
            for (let i = 0; i < numOpponents; i++) {
                opponents.push({
                    hand: [drawCard(), drawCard()],
                    stand: false
                });
            }
        }

        // Draw a card from the deck
        function drawCard() {
            return deck.shift();
        }

        // Calculate hand value
        function calculateHandValue(hand) {
            let value = 0;
            let numAces = 0;
            hand.forEach(card => {
                value += card.value;
                if (card.rank === 'A') numAces += 1;
            });
            // Adjust for Aces
            while (value > 21 && numAces > 0) {
                value -= 10;
                numAces -= 1;
            }
            return value;
        }

        // Render hands to the DOM
        function renderHands() {
            // Player's hand
            const playerHandDiv = document.getElementById('player-hand');
            playerHandDiv.innerHTML = '';
            playerHand.forEach(card => {
                const cardDiv = createCardElement(card);
                playerHandDiv.appendChild(cardDiv);
            });

            // Dealer's hand
            const dealerHandDiv = document.getElementById('dealer-hand');
            dealerHandDiv.innerHTML = '';
            dealerHand.forEach((card, index) => {
                const cardDiv = createCardElement(card);
                // Hide dealer's second card if game is not over
                if (index === 1 && !gameOver) {
                    cardDiv.textContent = '';
                    cardDiv.classList.add('card-back');
                }
                dealerHandDiv.appendChild(cardDiv);
            });

            // Update opponents' area
            const opponentsArea = document.getElementById('opponents-area');
            opponentsArea.innerHTML = `<h2>Opponents</h2><p id="opponents-info">There are ${numOpponents} opponents playing.</p>`;
        }

        // Create card element
        function createCardElement(card) {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card';
            cardDiv.dataset.rank = card.rank;
            cardDiv.dataset.suit = card.suit;

            // Display card content
            cardDiv.textContent = `${card.rank}${card.suit}`;

            return cardDiv;
        }

        // Player actions
        document.getElementById('hit').addEventListener('click', () => {
            if (gameOver) return;
            playerHand.push(drawCard());
            renderHands();
            checkPlayerBust();
        });

        document.getElementById('stand').addEventListener('click', () => {
            if (gameOver) return;
            document.getElementById('player-controls').style.display = 'none';
            opponentsPlay();
        });

        // Check if player busts
        function checkPlayerBust() {
            if (calculateHandValue(playerHand) > 21) {
                gameOver = true;
                document.getElementById('message').textContent = 'You busted! Dealer wins.';
                document.getElementById('player-controls').style.display = 'none';
                revealDealerHand();
                determineWinners();
            }
        }

        // Opponents' play (random)
        function opponentsPlay() {
            opponents.forEach(opponent => {
                while (calculateHandValue(opponent.hand) < 17 && !opponent.stand) {
                    if (Math.random() < 0.5) {
                        opponent.hand.push(drawCard());
                    } else {
                        opponent.stand = true;
                    }
                }
            });
            dealerPlay();
        }

        // Dealer's play
        function dealerPlay() {
            while (calculateHandValue(dealerHand) < 17) {
                dealerHand.push(drawCard());
            }
            determineWinners();
        }

        // Determine winners
        function determineWinners() {
            gameOver = true;
            revealDealerHand();
            const playerValue = calculateHandValue(playerHand);
            const dealerValue = calculateHandValue(dealerHand);
            const messageDiv = document.getElementById('message');

            let outcomeMessage = '';

            // Check outcomes
            if (playerValue > 21) {
                outcomeMessage = 'You busted! Dealer wins.';
            } else if (dealerValue > 21) {
                outcomeMessage = 'Dealer busted! You win!';
                balance += betAmount * 2;
            } else if (playerValue > dealerValue) {
                outcomeMessage = 'You win!';
                balance += betAmount * 2;
            } else if (playerValue < dealerValue) {
                outcomeMessage = 'Dealer wins!';
            } else {
                outcomeMessage = 'Push! It\'s a tie.';
                balance += betAmount; // Return bet
            }

            balanceSpan.textContent = balance;
            messageDiv.textContent = outcomeMessage;

            // Show opponents' results without revealing their hands
            opponents.forEach((opponent, index) => {
                const opponentDiv = document.createElement('div');
                opponentDiv.className = 'opponent-result';
                const opponentValue = calculateHandValue(opponent.hand);

                if (opponentValue > 21) {
                    opponentDiv.textContent = `Opponent ${index + 1} busted!`;
                } else if (opponentValue > dealerValue || dealerValue > 21) {
                    opponentDiv.textContent = `Opponent ${index + 1} wins!`;
                } else if (opponentValue < dealerValue) {
                    opponentDiv.textContent = `Opponent ${index + 1} loses!`;
                } else {
                    opponentDiv.textContent = `Opponent ${index + 1} ties.`;
                }
                document.getElementById('opponents-area').appendChild(opponentDiv);
            });

            // Offer to play again or quit if balance is zero
            const playAgainBtn = document.createElement('button');
            playAgainBtn.textContent = 'Play Again';
            playAgainBtn.addEventListener('click', resetGame);
            messageDiv.appendChild(document.createElement('br'));
            messageDiv.appendChild(playAgainBtn);

            if (balance <= 0) {
                const gameOverMsg = document.createElement('div');
                gameOverMsg.textContent = 'You have run out of money!';
                messageDiv.appendChild(gameOverMsg);
                playAgainBtn.disabled = true;
            }
        }

        // Reveal dealer's hand
        function revealDealerHand() {
            gameOver = true;
            renderHands();
        }

        // Reset game
        function resetGame() {
            if (balance <= 0) {
                alert('Game over! You have no more money.');
                return;
            }
            gameOver = false;
            betAmount = 0;
            playerHand = [];
            dealerHand = [];
            opponents = [];
            document.getElementById('message').textContent = '';
            document.getElementById('player-controls').style.display = 'block';
            playerArea.style.display = 'none';
            bettingArea.style.display = 'block';
            betAmountInput.value = Math.min(100, balance);
            balanceSpan.textContent = balance;
        }
    }
});
