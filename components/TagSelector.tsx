import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { Tag, X, Search, Plus, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { predefinedTags, getTagsByCategory } from '@/constants/tags';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  onClose?: () => void;
}

export default function TagSelector({ selectedTags, onTagsChange, onClose }: TagSelectorProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const tagsByCategory = getTagsByCategory();
  const categories = Object.keys(tagsByCategory);

  const handleTagPress = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter(t => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter(t => t !== tagName));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      onTagsChange([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const filteredTags = () => {
    if (!searchQuery.trim()) {
      if (activeCategory) {
        return tagsByCategory[activeCategory] || [];
      }
      return [];
    }
    
    const query = searchQuery.toLowerCase();
    return predefinedTags.filter(tag => 
      tag.name.toLowerCase().includes(query) ||
      tag.category.toLowerCase().includes(query)
    );
  };

  // Render selected tags
  const renderSelectedTags = () => {
    if (selectedTags.length === 0) {
      return <Text style={styles.placeholderText}>No tags selected</Text>;
    }
    
    return (
      <FlatList
        horizontal
        data={selectedTags}
        keyExtractor={(item, index) => `${item}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveTag(item)}>
              <X size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectedTagsScroll}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectedTagsContainer}>
        {renderSelectedTags()}
      </View>

      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Tag size={20} color={colors.primary} />
        <Text style={styles.selectorButtonText}>Select Tags</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Tags</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search tags..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.customTagContainer}>
              <TextInput
                style={styles.customTagInput}
                value={customTag}
                onChangeText={setCustomTag}
                placeholder="Add custom tag..."
                placeholderTextColor={colors.textSecondary}
                returnKeyType="done"
                onSubmitEditing={handleAddCustomTag}
              />
              <TouchableOpacity 
                style={styles.addCustomButton}
                onPress={handleAddCustomTag}
                disabled={!customTag.trim()}
              >
                <Plus size={20} color={customTag.trim() ? colors.primary : colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <FlatList
              horizontal
              data={categories}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    activeCategory === item && styles.activeCategoryButton
                  ]}
                  onPress={() => setActiveCategory(activeCategory === item ? null : item)}
                >
                  <Text 
                    style={[
                      styles.categoryButtonText,
                      activeCategory === item && styles.activeCategoryButtonText
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesScrollContent}
            />

            <FlatList
              data={filteredTags()}
              renderItem={({ item }) => {
                const isSelected = selectedTags.includes(item.name);
                return (
                  <TouchableOpacity
                    style={[
                      styles.tagItem,
                      isSelected && styles.tagItemSelected
                    ]}
                    onPress={() => handleTagPress(item.name)}
                  >
                    {isSelected && (
                      <Check size={14} color={colors.text} style={styles.checkIcon} />
                    )}
                    <Text 
                      style={[
                        styles.tagItemText,
                        isSelected && styles.tagItemTextSelected
                      ]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={item => item.id}
              numColumns={2}
              style={styles.tagsList}
              contentContainerStyle={styles.tagsListContent}
              ListEmptyComponent={
                <View style={styles.emptyTagsContainer}>
                  <Text style={styles.emptyTagsText}>
                    {searchQuery ? 'No matching tags found' : 'Select a category above'}
                  </Text>
                </View>
              }
            />

            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectedTagsContainer: {
    minHeight: 40,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 8,
  },
  selectedTagsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[700],
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagText: {
    fontSize: 14,
    color: colors.text,
    marginRight: 6,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 4,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
  selectorButtonText: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  customTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customTagInput: {
    flex: 1,
    height: 48,
    color: colors.text,
    fontSize: 16,
  },
  addCustomButton: {
    padding: 8,
  },
  categoriesScroll: {
    maxHeight: 50,
    marginBottom: 8,
  },
  categoriesScrollContent: {
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.text,
  },
  activeCategoryButtonText: {
    fontWeight: 'bold',
  },
  tagsList: {
    flex: 1,
  },
  tagsListContent: {
    paddingVertical: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 4,
    flex: 1,
    maxWidth: '48%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkIcon: {
    marginRight: 4,
  },
  tagItemText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  tagItemTextSelected: {
    fontWeight: 'bold',
  },
  emptyTagsContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTagsText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
});