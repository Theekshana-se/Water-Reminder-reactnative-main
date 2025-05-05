import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { getChatbotResponse } from '../../lib/openai';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Track if bot is "typing"
  const flatListRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Hi! I’m your WaterChat bot. Ask me about water or this app!',
        sender: 'bot',
        createdAt: new Date(),
      },
    ]);
  }, []);

  const typeMessage = (text, sender, callback) => {
    const words = text.split(' ');
    let currentText = '';
    let index = 0;

    setIsTyping(true);
    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += (index > 0 ? ' ' : '') + words[index];
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.sender === sender && lastMessage.isTyping) {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              text: currentText,
            };
          }
          return updatedMessages;
        });
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        callback();
      }
    }, 100); // Adjust speed (100ms per word)
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      text: inputText,
      sender: 'user',
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');

    const botResponseText = await getChatbotResponse(userMessage.text);
    const botMessage = {
      id: Math.random().toString(),
      text: '', // Start with empty text for typing effect
      sender: 'bot',
      createdAt: new Date(),
      isTyping: true, // Flag for typing animation
    };

    setMessages((prevMessages) => [...prevMessages, botMessage]);
    typeMessage(botResponseText, 'bot', () => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          isTyping: false, // Typing complete
        };
        return updatedMessages;
      });
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      {!item.isTyping && (
        <Text style={styles.timestamp}>
          {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
      {item.isTyping && <Text style={styles.typingIndicator}>...</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question about water..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC', // Light ChatGPT-like background
  },
  chatList: {
    padding: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF', // Blue for user messages
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White for bot messages
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#F7F7F7',
    color: '#000',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatScreen;