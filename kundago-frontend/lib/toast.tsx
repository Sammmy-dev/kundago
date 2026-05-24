import { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { View, Text, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';

type ToastType = 'success' | 'error';

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((msg: string, t: ToastType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(msg);
    setType(t);
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    timerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, [opacity]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Animated.View
        pointerEvents="none"
        style={{ opacity }}
        className="absolute top-14 left-4 right-4 items-center"
      >
        <View className={`flex-row items-center gap-2 px-5 py-3 rounded-full shadow-ambient ${type === 'success' ? 'bg-[#006e2f]' : 'bg-[#ba1a1a]'}`}>
          <Feather name={type === 'success' ? 'check' : 'x'} size={16} color="#ffffff" />
          <Text className="text-white font-semibold text-sm">{message}</Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}
