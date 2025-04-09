import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service here
    console.error('Error caught by error boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <AlertTriangle size={48} color={colors.danger} />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            
            <ScrollView style={styles.errorDetailsContainer}>
              <Text style={styles.errorMessage}>
                {error ? error.toString() : "An unknown error occurred"}
              </Text>
              
              {errorInfo && (
                <View style={styles.stackContainer}>
                  <Text style={styles.stackTitle}>Component Stack:</Text>
                  <Text style={styles.stackTrace}>
                    {errorInfo.componentStack}
                  </Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity style={styles.resetButton} onPress={this.handleReset}>
              <RefreshCw size={20} color={colors.white} />
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  errorDetailsContainer: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 24,
  },
  errorMessage: {
    fontSize: 16,
    color: colors.danger,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  stackContainer: {
    backgroundColor: colors.gray[800],
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ErrorBoundary;