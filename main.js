// main.js

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai"; 
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// Ваш API ключ (обязательно замените на реальный ключ)
let API_KEY = 'AIzaSyAqV2NQAYL1cUYAa_uCwfUW8UYwbqu6ems'; 

document.addEventListener('DOMContentLoaded', () => {
  const forms = [
    { 
      formId: 'initial-form', 
      promptName: 'new-prompt', 
      outputId: 'output1', 
      previousResponseNames: ['previous-response'], 
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'second-form', 
      promptName: 'new-prompt', 
      outputId: 'output2', 
      previousResponseNames: ['previous-response'], 
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'third-form', 
      promptName: 'risk-prompt', 
      outputId: 'output3', 
      previousResponseNames: ['action-plan'], 
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'fourth-form', 
      promptName: 'optimization-prompt', 
      outputId: 'output4', 
      previousResponseNames: ['risk-analysis'], 
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'fifth-form', 
      promptName: 'tech-prompt', 
      outputId: 'output5', 
      previousResponseNames: ['optimized-processes', 'project-deadline'], // Добавлено второе поле
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'sixth-form', 
      promptName: 'training-prompt', 
      outputId: 'output6', 
      previousResponseNames: ['implemented-tech'], 
      model: "gemini-1.5-pro" 
    },
    { 
      formId: 'seventh-form', 
      promptName: 'monitoring-prompt', 
      outputId: 'output7', 
      previousResponseNames: ['training-program'], 
      model: "gemini-1.5-pro" 
    }
  ];

  forms.forEach(({ formId, promptName, outputId, previousResponseNames, model }) => {
    const form = document.getElementById(formId);
    if (form) {
      console.log(`Добавлен обработчик для формы: ${formId}`);
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        console.log(`Форма ${formId} отправлена`);
        const output = document.getElementById(outputId);
        output.textContent = 'Generating...';

        try {
          const formData = new FormData(form);
          let combinedPrompt = '';

          // Собираем все предыдущие ответы
          previousResponseNames.forEach(name => {
            const value = formData.get(name);
            if (value) {
              combinedPrompt += value + '\n\n';
            }
          });

          // Добавляем новый промпт
          const newPrompt = formData.get(promptName);
          if (newPrompt) {
            combinedPrompt += newPrompt;
          }

          console.log(`Сгенерированный промпт: ${combinedPrompt}`);

          const contents = [
            {
              role: 'user',
              parts: [
                { text: combinedPrompt }
              ]
            }
          ];

          const genAI = new GoogleGenerativeAI(API_KEY);
          const generativeModel = genAI.getGenerativeModel({
            model: model,
            safetySettings: [
              {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
              },
            ],
          });

          const result = await generativeModel.generateContentStream({ contents });

          let buffer = [];
          let md = new MarkdownIt();
          for await (let response of result.stream) {
            buffer.push(response.text());
            output.innerHTML = md.render(buffer.join(''));
          }
          console.log(`Результат для ${formId} получен`);
        } catch (e) {
          console.error(`Ошибка при обработке формы ${formId}:`, e);
          output.innerHTML += '<hr>' + e;
        }
      });
    } else {
      console.warn(`Форма с id="${formId}" не найдена.`);
    }
  });

  maybeShowApiKeyBanner(API_KEY); 

  // Функция копирования текста в буфер обмена
  window.copyToClipboard = function(elementId) {
    const element = document.getElementById(elementId);
    let textToCopy = '';
    if (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input') {
      textToCopy = element.value;
    } else {
      textToCopy = element.textContent;
    }
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Текст скопирован в буфер обмена');
    }).catch(err => {
      console.error('Ошибка копирования', err);
    });
  }

  // Функция для AI Copy на Этапе 7
  window.aiCopy = function() {
    // Получение данных из других этапов
    const projectDetails = document.getElementById('stage1-textarea').value.trim();
    const projectDeadline = document.getElementById('stage5-textarea2').value.trim();
    const forceFieldAnalysis = document.getElementById('output2').textContent.trim();
    const stakeholderAnalysis = document.getElementById('output5').textContent.trim();
    const riskAnalysis = document.getElementById('output6').textContent.trim();

    // Проверка наличия необходимых данных
    if (!projectDetails || !projectDeadline || !forceFieldAnalysis || !stakeholderAnalysis || !riskAnalysis) {
      alert('Пожалуйста, убедитесь, что все необходимые этапы заполнены перед использованием AI Copy.');
      return;
    }

    // Формирование комбинированного текста
    const combinedText = `
Срок начала проекта и срок завершения проекта: ${projectDeadline}

Цель проекта изменений и тип изменений: ${projectDetails}

Мероприятия из анализа поля сил:
${forceFieldAnalysis}

Мероприятия из анализа стейкхолдеров:
${stakeholderAnalysis}

Мероприятия из анализа рисков:
${riskAnalysis}
    `.trim();

    // Вставка текста в Stage 7 textarea
    const stage7Textarea = document.getElementById('stage7-textarea');
    stage7Textarea.value = combinedText;

    alert('Информация успешно скопирована в текстовое поле "Срок начала проекта и срок завершения проекта. Цель проекта изменений, тип изменений. Скопируйте и вставьте мероприятия из анализа поля сил, анализа стейкхолдеров и анализа рисков."');
  }

  // Навигация для мобильных устройств
  const mobileMenu = document.getElementById('mobile-menu');
  const navbarMenu = document.querySelector('.navbar-menu');

  if (mobileMenu && navbarMenu) {
    mobileMenu.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
      mobileMenu.classList.toggle('active');
    });
  }
});
