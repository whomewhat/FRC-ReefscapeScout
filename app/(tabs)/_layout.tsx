import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { 
  Home, 
  Settings, 
  FileText, 
  Calendar, 
  Users,
  Award
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useThemeStore from '@/store/theme-store';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useThemeStore();
  
  const isDark = theme === 'dark' || (theme === 'system' && colorScheme === 'dark');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDark ? colors.gray[400] : colors.gray[500],
        tabBarStyle: {
          backgroundColor: isDark ? colors.gray[900] : colors.white,
          borderTopColor: isDark ? colors.gray[800] : colors.gray[200],
        },
        headerStyle: {
          backgroundColor: isDark ? colors.gray[900] : colors.white,
        },
        headerTintColor: isDark ? colors.white : colors.gray[900],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scouting"
        options={{
          title: 'Scouting',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alliance"
        options={{
          title: 'Alliance',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alliance-drafting"
        options={{
          title: 'Drafting',
          tabBarIcon: ({ color }) => <Award size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}