import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Platform,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Copy, 
  FileJson,
  CheckCircle,
  Filter
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import useAppStore from '@/store/app-store';
import useScoutingStore from '@/store/scouting-store';
import * as Clipboard from 'expo-clipboard';

export default function JsonExportScreen() {
  const { exportData, notes } = useAppStore();
  const { records, getManualRecords } = useScoutingStore();
  const [copied, setCopied] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [userContentOnly, setUserContentOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Generate the JSON data
    generateJsonData();
  }, [userContentOnly]);
  
  const generateJsonData = () => {
    setIsLoading(true);
    
    try {
      if (userContentOnly) {
        // Export only user-created content (notes and manual scouting records)
        const manualRecords = getManualRecords();
        
        const userData = {
          notes: notes,
          scoutingRecords: manualRecords,
          timestamp: Date.now(),
          version: "1.0.0"
        };
        
        setJsonData(JSON.stringify(userData, null, 2));
      } else {
        // Export all app data
        const appData = exportData();
        setJsonData(JSON.stringify(appData, null, 2));
      }
    } catch (error) {
      console.error("Error generating JSON data:", error);
      Alert.alert("Error", "Failed to generate JSON data");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web
        if (navigator && navigator.clipboard) {
          await navigator.clipboard.writeText(jsonData);
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
          Alert.alert('Success', 'JSON data copied to clipboard');
        } else {
          Alert.alert('Copy to Clipboard', 'Clipboard API not available in this browser');
        }
      } else {
        // For native
        await Clipboard.setStringAsync(jsonData);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        Alert.alert('Success', 'JSON data copied to clipboard');
      }
    } catch (error) {
      console.error("Clipboard error:", error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <FileJson size={48} color={colors.primary} />
        <Text style={styles.title}>Export Data as JSON</Text>
        <Text style={styles.description}>
          Your data has been exported as JSON. You can copy it to the clipboard.
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <Filter size={20} color={colors.primary} />
          <Text style={styles.filterText}>Export user-created content only</Text>
          <Switch
            value={userContentOnly}
            onValueChange={setUserContentOnly}
            trackColor={{ false: colors.gray[600], true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
        <Text style={styles.filterDescription}>
          {userContentOnly 
            ? "Exporting only manually entered notes and scouting records." 
            : "Exporting all data, including teams, matches, and TBA-imported records."}
        </Text>
      </View>
      
      <View style={styles.jsonContainer}>
        <View style={styles.jsonHeader}>
          <Text style={styles.jsonHeaderText}>JSON Data</Text>
          {isLoading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Generating JSON data...</Text>
          </View>
        ) : (
          <ScrollView style={styles.jsonViewer}>
            <Text style={styles.jsonText}>{jsonData}</Text>
          </ScrollView>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleCopyToClipboard}
          disabled={isLoading}
        >
          {copied ? (
            <CheckCircle size={24} color={colors.success} />
          ) : (
            <Copy size={24} color={colors.primary} />
          )}
          <Text style={[
            styles.actionButtonText,
            isLoading && styles.actionButtonTextDisabled
          ]}>
            {copied ? 'Copied!' : 'Copy to Clipboard'}
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
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginLeft: 12,
  },
  filterDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  jsonContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  jsonHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.gray[800],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jsonHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  jsonViewer: {
    flex: 1,
    padding: 12,
  },
  jsonText: {
    color: colors.text,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 200,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  actionButtonTextDisabled: {
    color: colors.gray[500],
  },
});