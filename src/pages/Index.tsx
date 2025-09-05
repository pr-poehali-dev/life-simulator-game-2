import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Player {
  name: string;
  age: number;
  grade: number;
  health: number;
  money: number;
  happiness: number;
  education: number;
  career: string;
  hasHouse: boolean;
  hasPartner: boolean;
  currentTask: string;
  hcCoins: number;
  rubles: number;
  hasPremium: boolean;
  premiumExpiry: number;
  upgrades: {
    educationBoost: boolean;
    hcBonus: boolean;
    aiHelper: boolean;
  };
}

interface Question {
  question: string;
  answer: number;
  options: number[];
}

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'career' | 'life' | 'shop'>('menu');
  const [player, setPlayer] = useState<Player>({
    name: 'Ты',
    age: 7,
    grade: 1,
    health: 100,
    money: 0,
    happiness: 80,
    education: 0,
    career: '',
    hasHouse: false,
    hasPartner: false,
    currentTask: 'Пройти 1 класс',
    hcCoins: 0,
    rubles: 1000,
    hasPremium: false,
    premiumExpiry: 0,
    upgrades: {
      educationBoost: false,
      hcBonus: false,
      aiHelper: false
    }
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showAiHint, setShowAiHint] = useState(false);

  // Система сохранения
  const saveGame = (playerData: Player) => {
    try {
      localStorage.setItem('himolife_save', JSON.stringify(playerData));
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const loadGame = (): Player | null => {
    try {
      const saved = localStorage.getItem('himolife_save');
      if (saved) {
        const data = JSON.parse(saved);
        // Проверка истечения премиума
        if (data.premiumExpiry && Date.now() > data.premiumExpiry) {
          data.hasPremium = false;
          data.premiumExpiry = 0;
        }
        // Добавление новых полей если их нет
        if (!data.rubles) data.rubles = 1000;
        if (!data.upgrades) data.upgrades = { educationBoost: false, hcBonus: false, aiHelper: false };
        return data;
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
    return null;
  };

  // Загрузка при старте
  useEffect(() => {
    const savedData = loadGame();
    if (savedData) {
      setPlayer(savedData);
    }
  }, []);

  // Автосохранение при изменении игрока
  useEffect(() => {
    if (player.grade > 1 || player.hcCoins > 0) {
      saveGame(player);
    }
  }, [player]);

  const getQuestionsForGrade = (grade: number, hasPremium: boolean): number => {
    return hasPremium ? 5 : 10;
  };

  const generateQuestion = (grade: number, hasPremium: boolean): Question => {
    let question = '';
    let answer = 0;
    let options: number[] = [];

    // Упрощенные задачи для премиума
    const difficultyMultiplier = hasPremium ? 0.7 : 1;

    if (grade <= 3) {
      const maxNum = Math.floor(20 * difficultyMultiplier);
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      const operation = Math.random() > 0.5 ? '+' : '-';
      
      if (operation === '+') {
        answer = a + b;
        question = `${a} + ${b} = ?`;
      } else {
        if (a < b) [a, b] = [b, a];
        answer = a - b;
        question = `${a} - ${b} = ?`;
      }
    } else if (grade <= 6) {
      const maxNum = Math.floor(12 * difficultyMultiplier);
      const a = Math.floor(Math.random() * maxNum) + 1;
      const b = Math.floor(Math.random() * maxNum) + 1;
      const operation = Math.random() > 0.5 ? '*' : '/';
      
      if (operation === '*') {
        answer = a * b;
        question = `${a} × ${b} = ?`;
      } else {
        const product = a * b;
        answer = a;
        question = `${product} ÷ ${b} = ?`;
      }
    } else {
      const maxNum = Math.floor(100 * difficultyMultiplier) + 10;
      const a = Math.floor(Math.random() * maxNum) + 10;
      const b = Math.floor(Math.random() * 10) + 2;
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      if (operation === '+') {
        answer = a + b;
        question = `${a} + ${b} = ?`;
      } else if (operation === '-') {
        answer = a - b;
        question = `${a} - ${b} = ?`;
      } else {
        answer = a * b;
        question = `${a} × ${b} = ?`;
      }
    }

    options = [answer];
    while (options.length < 4) {
      const wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
      if (wrongAnswer !== answer && wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    return { question, answer, options: options.sort(() => Math.random() - 0.5) };
  };

  const startGame = () => {
    setGameState('playing');
    setQuestionsCompleted(0);
    setCurrentQuestion(generateQuestion(player.grade, player.hasPremium));
    setShowAiHint(false);
  };

  const exitGame = () => {
    setGameState('menu');
    setCurrentQuestion(null);
    setQuestionsCompleted(0);
    setShowResult(false);
    setShowAiHint(false);
  };

  const useAiHelper = () => {
    if (player.upgrades.aiHelper && player.education >= 20) {
      setShowAiHint(true);
      setPlayer(prev => ({
        ...prev,
        education: prev.education - 20
      }));
    }
  };

  const answerQuestion = (selectedAnswer: number) => {
    const correct = selectedAnswer === currentQuestion?.answer;
    setLastAnswerCorrect(correct);
    setShowResult(true);
    setShowAiHint(false);

    setTimeout(() => {
      setShowResult(false);
      const newCompleted = questionsCompleted + 1;
      setQuestionsCompleted(newCompleted);

      if (correct) {
        const educationGain = player.upgrades.educationBoost ? 15 : 10;
        setPlayer(prev => ({
          ...prev,
          education: prev.education + educationGain,
          happiness: Math.min(prev.happiness + 5, 100)
        }));
      } else {
        setPlayer(prev => ({
          ...prev,
          happiness: Math.max(prev.happiness - 3, 0)
        }));
      }

      const totalQuestions = getQuestionsForGrade(player.grade, player.hasPremium);
      if (newCompleted >= totalQuestions) {
        completeGrade();
      } else {
        setCurrentQuestion(generateQuestion(player.grade, player.hasPremium));
      }
    }, 1500);
  };

  const completeGrade = () => {
    const newGrade = player.grade + 1;
    const newAge = player.age + 1;
    const baseHcReward = 100;
    const hcReward = player.upgrades.hcBonus ? Math.floor(baseHcReward * 1.1) : baseHcReward;
    const rubleReward = player.grade * 50;

    if (newGrade === 10) {
      setPlayer(prev => ({
        ...prev,
        grade: newGrade,
        age: newAge,
        education: prev.education + 50,
        hcCoins: prev.hcCoins + hcReward,
        rubles: prev.rubles + rubleReward
      }));
      setGameState('career');
    } else if (newGrade > 11) {
      setPlayer(prev => ({
        ...prev,
        hcCoins: prev.hcCoins + hcReward,
        rubles: prev.rubles + rubleReward
      }));
      setGameState('life');
    } else {
      setPlayer(prev => ({
        ...prev,
        grade: newGrade,
        age: newAge,
        education: prev.education + 50,
        hcCoins: prev.hcCoins + hcReward,
        rubles: prev.rubles + rubleReward,
        currentTask: `Пройти ${newGrade} класс`
      }));
      setQuestionsCompleted(0);
      setCurrentQuestion(generateQuestion(newGrade, player.hasPremium));
    }
  };

  const buyPremium = () => {
    if (player.hcCoins >= 500) {
      const expiryDate = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 дней
      setPlayer(prev => ({
        ...prev,
        hcCoins: prev.hcCoins - 500,
        hasPremium: true,
        premiumExpiry: expiryDate
      }));
      setShowPremiumModal(false);
    }
  };

  const buyUpgrade = (upgradeType: string, cost: number, currency: 'hc' | 'rubles') => {
    const canAfford = currency === 'hc' ? player.hcCoins >= cost : player.rubles >= cost;
    
    if (canAfford) {
      setPlayer(prev => ({
        ...prev,
        [currency === 'hc' ? 'hcCoins' : 'rubles']: currency === 'hc' ? prev.hcCoins - cost : prev.rubles - cost,
        upgrades: {
          ...prev.upgrades,
          [upgradeType]: true
        }
      }));
    }
  };

  const chooseCareer = (career: string) => {
    let baseSalary = 0;

    switch (career) {
      case 'courier':
        baseSalary = 25000;
        break;
      case 'warehouse':
        baseSalary = 30000;
        break;
      case 'manager':
        baseSalary = 80000;
        break;
    }

    setPlayer(prev => ({
      ...prev,
      career,
      money: baseSalary,
      currentTask: 'Строить карьеру и личную жизнь'
    }));
    setGameState('life');
  };

  const buyHouse = () => {
    if (player.money >= 50000) {
      setPlayer(prev => ({
        ...prev,
        money: prev.money - 50000,
        hasHouse: true,
        happiness: prev.happiness + 20
      }));
    }
  };

  const findPartner = () => {
    if (player.age >= 18) {
      setPlayer(prev => ({
        ...prev,
        hasPartner: true,
        happiness: prev.happiness + 15
      }));
    }
  };

  const resetGame = () => {
    const newPlayer = {
      name: 'Ты',
      age: 7,
      grade: 1,
      health: 100,
      money: 0,
      happiness: 80,
      education: 0,
      career: '',
      hasHouse: false,
      hasPartner: false,
      currentTask: 'Пройти 1 класс',
      hcCoins: player.hcCoins,
      rubles: player.rubles,
      hasPremium: player.hasPremium,
      premiumExpiry: player.premiumExpiry,
      upgrades: player.upgrades
    };
    setPlayer(newPlayer);
    setGameState('menu');
  };

  const getDaysRemaining = () => {
    if (!player.hasPremium || !player.premiumExpiry) return 0;
    const remaining = player.premiumExpiry - Date.now();
    return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Симулятор Жизни</h1>
              <p className="text-gray-600">Прожи свою жизнь с самого начала!</p>
            </div>

            {/* Валюты */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Coins" size={20} />
                  <span className="text-xl font-bold">{player.hcCoins} HC</span>
                </div>
                <div className="text-xs opacity-90 mt-1">HimoCoin</div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Banknote" size={20} />
                  <span className="text-xl font-bold">{player.rubles.toLocaleString()} ₽</span>
                </div>
                <div className="text-xs opacity-90 mt-1">Рубли</div>
              </Card>
            </div>

            {/* Премиум статус */}
            {player.hasPremium ? (
              <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <div className="flex items-center justify-center gap-2">
                  <Icon name="Crown" size={20} />
                  <span className="font-semibold">HimoLife+</span>
                </div>
                <div className="text-sm opacity-90">
                  Осталось: {getDaysRemaining()} {getDaysRemaining() === 1 ? 'день' : 'дней'}
                </div>
              </Card>
            ) : (
              <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
                <DialogTrigger asChild>
                  <Card className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-center gap-2">
                      <Icon name="Crown" size={20} />
                      <span className="font-semibold">Купить HimoLife+</span>
                    </div>
                    <div className="text-sm opacity-90">500 HC на неделю</div>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icon name="Crown" size={24} className="text-purple-500" />
                      HimoLife+ Премиум
                    </DialogTitle>
                    <DialogDescription>
                      Ускорь своё обучение с премиум подпиской!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Преимущества:</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Только 5 заданий вместо 10</li>
                        <li>• Упрощённые задачи</li>
                        <li>• Быстрое прохождение классов</li>
                      </ul>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold">500 HC</div>
                        <div className="text-sm text-gray-500">на 7 дней</div>
                      </div>
                      <Button
                        onClick={buyPremium}
                        disabled={player.hcCoins < 500}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        {player.hcCoins >= 500 ? 'Купить' : 'Недостаточно HC'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Прогресс игрока */}
            {(player.grade > 1 || player.education > 0) && (
              <Card className="p-4 bg-white/80 backdrop-blur">
                <div className="text-sm text-gray-600 mb-2">Твой прогресс:</div>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{player.grade} класс</Badge>
                  <Badge variant="outline">{player.age} лет</Badge>
                  <Badge variant="outline">
                    <Icon name="Brain" size={14} className="mr-1" />
                    {player.education}
                  </Badge>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-white/80 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icon name="GraduationCap" size={24} className="text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Обучение</div>
                    <div className="text-sm text-gray-600">
                      {player.hasPremium ? 'Решай по 5 примеров (Премиум)' : 'Проходи классы, решая по 10 примеров'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Icon name="ShoppingBag" size={24} className="text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">Магазин</div>
                    <div className="text-sm text-gray-600">Покупай улучшения за валюту</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Icon name="Home" size={24} className="text-success" />
                  <div className="text-left">
                    <div className="font-semibold">Жизнь</div>
                    <div className="text-sm text-gray-600">Стройте дом и семью</div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button onClick={startGame} size="lg" className="w-full text-lg py-6">
                <Icon name="Play" size={20} className="mr-2" />
                {player.grade > 1 ? 'Продолжить' : 'Начать Игру'}
              </Button>
              
              <Button onClick={() => setGameState('shop')} variant="outline" className="w-full">
                <Icon name="ShoppingBag" size={16} className="mr-2" />
                Магазин улучшений
              </Button>
              
              {player.grade > 1 && (
                <Button onClick={resetGame} variant="outline" className="w-full">
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Новая жизнь
                </Button>
              )}
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <Card className="p-4 bg-white/90 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Badge variant="secondary">{player.grade} класс</Badge>
                  <Badge variant="outline">{player.age} лет</Badge>
                  {player.hasPremium && (
                    <Badge className="bg-purple-500">
                      <Icon name="Crown" size={12} className="mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <Button onClick={exitGame} variant="outline" size="sm">
                  <Icon name="X" size={16} />
                </Button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Icon name="Coins" size={16} className="text-yellow-500" />
                    <span className="font-semibold">{player.hcCoins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Banknote" size={16} className="text-green-500" />
                    <span className="font-semibold">{player.rubles.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right text-sm">
                  Вопрос {questionsCompleted + 1}/{getQuestionsForGrade(player.grade, player.hasPremium)}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <Icon name="Heart" size={16} className="mx-auto text-red-500" />
                  <div className="text-xs">Здоровье</div>
                  <div className="font-semibold">{player.health}</div>
                </div>
                <div className="text-center">
                  <Icon name="Smile" size={16} className="mx-auto text-yellow-500" />
                  <div className="text-xs">Счастье</div>
                  <div className="font-semibold">{player.happiness}</div>
                </div>
                <div className="text-center">
                  <Icon name="Brain" size={16} className="mx-auto text-purple-500" />
                  <div className="text-xs">Знания</div>
                  <div className="font-semibold">{player.education}</div>
                </div>
              </div>

              <Progress 
                value={(questionsCompleted / getQuestionsForGrade(player.grade, player.hasPremium)) * 100} 
                className="mb-4" 
              />
            </Card>

            {currentQuestion && !showResult && (
              <Card className="p-6 bg-white/90 backdrop-blur">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-center text-xl">{currentQuestion.question}</CardTitle>
                  <div className="flex items-center justify-center gap-2">
                    {player.hasPremium && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        Упрощённый режим
                      </Badge>
                    )}
                    {player.upgrades.aiHelper && player.education >= 20 && !showAiHint && (
                      <Button onClick={useAiHelper} variant="outline" size="sm" className="text-xs">
                        <Icon name="Bot" size={14} className="mr-1" />
                        ИИ-подсказка (-20 знаний)
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                {showAiHint && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Icon name="Bot" size={16} />
                      <span className="text-sm font-medium">ИИ-помощник:</span>
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Правильный ответ: <span className="font-bold">{currentQuestion.answer}</span>
                    </div>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={showAiHint && option === currentQuestion.answer ? "default" : "outline"}
                        onClick={() => answerQuestion(option)}
                        className={`h-14 text-lg ${showAiHint && option === currentQuestion.answer ? 'bg-blue-500 text-white' : ''}`}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {showResult && (
              <Card className={`p-6 text-center ${lastAnswerCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Icon 
                    name={lastAnswerCorrect ? "CheckCircle" : "XCircle"} 
                    size={24} 
                    className={lastAnswerCorrect ? "text-green-600" : "text-red-600"} 
                  />
                  <span className={`font-semibold ${lastAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {lastAnswerCorrect ? 'Правильно!' : 'Неверно!'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Правильный ответ: {currentQuestion?.answer}
                </p>
                {questionsCompleted + 1 === getQuestionsForGrade(player.grade, player.hasPremium) && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-yellow-800 mb-1">
                      <Icon name="Award" size={16} />
                      <span className="text-sm font-semibold">Класс пройден!</span>
                    </div>
                    <div className="text-xs text-yellow-700">
                      +{player.upgrades.hcBonus ? 110 : 100} HC, +{player.grade * 50}₽
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {gameState === 'career' && (
          <div className="space-y-4">
            <Card className="p-4 bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Выбор карьеры</CardTitle>
                <CardDescription>
                  Ты окончил 9 класс. Что дальше?
                </CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">9 класс окончен</Badge>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Coins" size={16} className="text-yellow-500" />
                    <span className="font-semibold">{player.hcCoins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Banknote" size={16} className="text-green-500" />
                    <span className="font-semibold">{player.rubles.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => chooseCareer('courier')}>
                <div className="flex items-center gap-3">
                  <Icon name="Bike" size={24} className="text-blue-600" />
                  <div>
                    <div className="font-semibold">Курьер</div>
                    <div className="text-sm text-gray-600">25,000₽/мес</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => chooseCareer('warehouse')}>
                <div className="flex items-center gap-3">
                  <Icon name="Package" size={24} className="text-orange-600" />
                  <div>
                    <div className="font-semibold">Работник склада</div>
                    <div className="text-sm text-gray-600">30,000₽/мес</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setPlayer(prev => ({ ...prev, grade: 10, currentTask: 'Закончить школу' }));
                setGameState('playing');
                setQuestionsCompleted(0);
                setCurrentQuestion(generateQuestion(10, player.hasPremium));
              }}>
                <div className="flex items-center gap-3">
                  <Icon name="GraduationCap" size={24} className="text-purple-600" />
                  <div>
                    <div className="font-semibold">Продолжить учёбу</div>
                    <div className="text-sm text-gray-600">Шанс на лучшую работу</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {gameState === 'shop' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Магазин</h2>
              <Button onClick={() => setGameState('menu')} variant="outline" size="sm">
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                Назад
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="p-3 bg-yellow-50">
                <div className="flex items-center gap-2">
                  <Icon name="Coins" size={16} />
                  <span className="font-semibold">{player.hcCoins} HC</span>
                </div>
              </Card>
              <Card className="p-3 bg-green-50">
                <div className="flex items-center gap-2">
                  <Icon name="Banknote" size={16} />
                  <span className="font-semibold">{player.rubles.toLocaleString()} ₽</span>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              <Card className={`p-4 ${player.upgrades.educationBoost ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="TrendingUp" size={24} className="text-blue-600" />
                    <div>
                      <div className="font-semibold">Ускорение образования</div>
                      <div className="text-sm text-gray-600">+50% знаний за правильный ответ</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {player.upgrades.educationBoost ? (
                      <Badge className="bg-green-500">Куплено</Badge>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">200 HC</div>
                        <Button
                          onClick={() => buyUpgrade('educationBoost', 200, 'hc')}
                          disabled={player.hcCoins < 200}
                          size="sm"
                        >
                          Купить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className={`p-4 ${player.upgrades.hcBonus ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Plus" size={24} className="text-yellow-600" />
                    <div>
                      <div className="font-semibold">Дополнительные HC</div>
                      <div className="text-sm text-gray-600">+10% HC за прохождение класса</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {player.upgrades.hcBonus ? (
                      <Badge className="bg-green-500">Куплено</Badge>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">300 HC</div>
                        <Button
                          onClick={() => buyUpgrade('hcBonus', 300, 'hc')}
                          disabled={player.hcCoins < 300}
                          size="sm"
                        >
                          Купить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className={`p-4 ${player.upgrades.aiHelper ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name="Bot" size={24} className="text-purple-600" />
                    <div>
                      <div className="font-semibold">ИИ-помощник</div>
                      <div className="text-sm text-gray-600">Подсказывает ответы (-20 знаний)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {player.upgrades.aiHelper ? (
                      <Badge className="bg-green-500">Куплено</Badge>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-500">5,000 ₽</div>
                        <Button
                          onClick={() => buyUpgrade('aiHelper', 5000, 'rubles')}
                          disabled={player.rubles < 5000}
                          size="sm"
                        >
                          Купить
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {gameState === 'life' && (
          <div className="space-y-4">
            <Card className="p-4 bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Твоя жизнь</CardTitle>
                <CardDescription>
                  {player.career === 'manager' ? 'Руководитель завода' : 
                   player.career === 'courier' ? 'Курьер' : 'Работник склада'}
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Icon name="Wallet" size={20} className="mx-auto text-green-600" />
                  <div className="text-sm">Деньги</div>
                  <div className="font-semibold">{player.money.toLocaleString()}₽</div>
                </div>
                <div className="text-center">
                  <Icon name="Calendar" size={20} className="mx-auto text-blue-600" />
                  <div className="text-sm">Возраст</div>
                  <div className="font-semibold">{player.age} лет</div>
                </div>
                <div className="text-center">
                  <Icon name="Coins" size={20} className="mx-auto text-yellow-600" />
                  <div className="text-sm">HC + ₽</div>
                  <div className="font-semibold">{player.hcCoins} + {player.rubles.toLocaleString()}</div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              {!player.hasHouse && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Home" size={24} className="text-green-600" />
                      <div>
                        <div className="font-semibold">Купить дом</div>
                        <div className="text-sm text-gray-600">50,000₽</div>
                      </div>
                    </div>
                    <Button 
                      onClick={buyHouse}
                      disabled={player.money < 50000}
                      size="sm"
                    >
                      Купить
                    </Button>
                  </div>
                </Card>
              )}

              {player.hasHouse && (
                <Card className="p-4 border-green-200 bg-green-50">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle" size={24} className="text-green-600" />
                    <div className="font-semibold text-green-700">У тебя есть дом!</div>
                  </div>
                </Card>
              )}

              {!player.hasPartner && player.age >= 18 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="Heart" size={24} className="text-pink-600" />
                      <div>
                        <div className="font-semibold">Найти партнёра</div>
                        <div className="text-sm text-gray-600">Создать семью</div>
                      </div>
                    </div>
                    <Button onClick={findPartner} size="sm">
                      Искать
                    </Button>
                  </div>
                </Card>
              )}

              {player.hasPartner && (
                <Card className="p-4 border-pink-200 bg-pink-50">
                  <div className="flex items-center gap-3">
                    <Icon name="Heart" size={24} className="text-pink-600" />
                    <div className="font-semibold text-pink-700">У тебя есть партнёр! 💕</div>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => setGameState('shop')}
                variant="outline" 
                className="w-full"
              >
                <Icon name="ShoppingBag" size={16} className="mr-2" />
                Посетить магазин
              </Button>
              
              <Button 
                onClick={resetGame}
                variant="outline" 
                className="w-full"
              >
                Начать новую жизнь
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;