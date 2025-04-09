import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Upload, 
  FileJson,
  CheckCircle,
  AlertTriangle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import { useRouter } from 'expo-router';

export default function JsonImportScreen() {
  const router = useRouter();
  const { importData } = useAppStore();
  const { importRecords } = useScoutingStore();
  const [jsonText, setJsonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    if (!jsonText.trim()) {
      Alert.alert('Error', 'Please enter JSON data to import');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Parse JSON
      const data = JSON.parse(jsonText);
      
      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format');
      }
      
      // Import app data
      importData(data);
      
      // Import scouting records if available
      if (data.scoutingRecords && Array.isArray(data.scoutingRecords)) {
        importRecords(data.scoutingRecords);
      }
      
      // Show success
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        // Navigate back after successful import
        router.back();
      }, 2000);
      
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse JSON data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <FileJson size={48} color={colors.primary} />
        <Text style={styles.title}>Import Data from JSON</Text>
        <Text style={styles.description}>
          Paste your JSON data below to import it into the app.
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>JSON Data</Text>
        <TextInput
          style={styles.jsonInput}
          multiline
          placeholder="Paste your JSON data here..."
          placeholderTextColor={colors.gray[500]}
          value={jsonText}
          onChangeText={setJsonText}
          editable={!isLoading && !importSuccess}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <AlertTriangle size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[
            styles.actionButton,
            (isLoading || !jsonText.trim()) && styles.actionButtonDisabled
          ]}
          onPress={handleImport}
          disabled={isLoading || !jsonText.trim() || importSuccess}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : importSuccess ? (
            <CheckCircle size={24} color={colors.white} />
          ) : (
            <Upload size={24} color={colors.white} />
          )}
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Importing...' : importSuccess ? 'Import Successful!' : 'Import Data'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  jsonInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    color: colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  errorContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.danger + '20',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    marginLeft: 8,
    flex: 1,
  },
  actionsContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonDisabled: {
    backgroundColor: colors.gray[700],
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 8,
  },
});