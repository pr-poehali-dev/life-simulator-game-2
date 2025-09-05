import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
}

interface Question {
  question: string;
  answer: number;
  options: number[];
}

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'career' | 'life'>('menu');
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
    currentTask: 'Пройти 1 класс'
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const generateQuestion = (grade: number): Question => {
    let question = '';
    let answer = 0;
    let options: number[] = [];

    if (grade <= 3) {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
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
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
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
      const a = Math.floor(Math.random() * 100) + 10;
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
    setCurrentQuestion(generateQuestion(player.grade));
  };

  const answerQuestion = (selectedAnswer: number) => {
    const correct = selectedAnswer === currentQuestion?.answer;
    setLastAnswerCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      setShowResult(false);
      const newCompleted = questionsCompleted + 1;
      setQuestionsCompleted(newCompleted);

      if (correct) {
        setPlayer(prev => ({
          ...prev,
          education: prev.education + 10,
          happiness: Math.min(prev.happiness + 5, 100)
        }));
      } else {
        setPlayer(prev => ({
          ...prev,
          happiness: Math.max(prev.happiness - 3, 0)
        }));
      }

      if (newCompleted >= 10) {
        completeGrade();
      } else {
        setCurrentQuestion(generateQuestion(player.grade));
      }
    }, 1500);
  };

  const completeGrade = () => {
    const newGrade = player.grade + 1;
    const newAge = player.age + 1;

    if (newGrade === 10) {
      setGameState('career');
    } else if (newGrade > 11) {
      setGameState('life');
    } else {
      setPlayer(prev => ({
        ...prev,
        grade: newGrade,
        age: newAge,
        education: prev.education + 50,
        currentTask: `Пройти ${newGrade} класс`
      }));
      setQuestionsCompleted(0);
      setCurrentQuestion(generateQuestion(newGrade));
    }
  };

  const chooseCareer = (career: string) => {
    let baseSalary = 0;
    let description = '';

    switch (career) {
      case 'courier':
        baseSalary = 25000;
        description = 'Курьер - честная работа, хорошая физическая форма';
        break;
      case 'warehouse':
        baseSalary = 30000;
        description = 'Работник склада - стабильная работа';
        break;
      case 'manager':
        baseSalary = 80000;
        description = 'Руководитель завода - высокая зарплата, престиж';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {gameState === 'menu' && (
          <div className="text-center space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Симулятор Жизни</h1>
              <p className="text-gray-600">Прожи свою жизнь с самого начала!</p>
            </div>

            <Card className="p-6 bg-white/80 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Icon name="GraduationCap" size={24} className="text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Обучение</div>
                    <div className="text-sm text-gray-600">Проходи классы, решая примеры</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Icon name="Briefcase" size={24} className="text-warning" />
                  <div className="text-left">
                    <div className="font-semibold">Карьера</div>
                    <div className="text-sm text-gray-600">Выбери свой путь после школы</div>
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

            <Button onClick={startGame} size="lg" className="w-full text-lg py-6">
              <Icon name="Play" size={20} className="mr-2" />
              Начать Игру
            </Button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <Card className="p-4 bg-white/90 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge variant="secondary">{player.grade} класс</Badge>
                  <Badge variant="outline" className="ml-2">{player.age} лет</Badge>
                </div>
                <div className="text-right text-sm">
                  <div>Вопрос {questionsCompleted + 1}/10</div>
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

              <Progress value={(questionsCompleted / 10) * 100} className="mb-4" />
            </Card>

            {currentQuestion && !showResult && (
              <Card className="p-6 bg-white/90 backdrop-blur">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-center text-xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => answerQuestion(option)}
                        className="h-14 text-lg"
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
                setCurrentQuestion(generateQuestion(10));
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

              <div className="grid grid-cols-2 gap-4">
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

            <Button 
              onClick={() => {
                setGameState('menu');
                setPlayer({
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
                  currentTask: 'Пройти 1 класс'
                });
              }}
              variant="outline" 
              className="w-full"
            >
              Начать заново
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;