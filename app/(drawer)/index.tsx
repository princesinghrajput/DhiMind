import { View, Text, ScrollView, TouchableOpacity, useColorScheme, StyleSheet, Image, Modal, TextInput, Alert, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Category, getCategories, createCategory } from '../../services/category.service';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState({
    title: '',
    icon: '📚'
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const icons = ['📚', '📐', '🔬', '🗣️', '🎨', '🎵', '🌍', '💻', '🧮', '⚡'];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleAddCategory = async () => {
    if (!newCategory.title.trim()) {
      Alert.alert('Error', 'Please enter a category title');
      return;
    }

    try {
      const category = await createCategory(newCategory);
      setCategories([category, ...categories]);
      setModalVisible(false);
      setNewCategory({ title: '', icon: '📚' });
    } catch (error: any) {
      console.error('Error creating category:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create category'
      );
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: isDark ? '#1a1b1e' : '#fff' }
      ]}
      onPress={() => router.push(`/category/${item._id}`)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[styles.categoryTitle, { color: isDark ? '#fff' : '#000' }]}>
        {item.title}
      </Text>
      <Text style={[styles.categoryCount, { color: isDark ? '#aaa' : '#666' }]}>
        {item.count} cards
      </Text>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: isDark ? '#fff' : '#000' }]}>
        No categories yet
      </Text>
      <Text style={[styles.emptySubText, { color: isDark ? '#aaa' : '#666' }]}>
        Create your first category to get started
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#f5f5f5' }}>
      {/* Fixed Header Section */}
      <View style={styles.headerSection}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: isDark ? '#fff' : '#000' }]}>
              Hello, {user?.name} 👋
            </Text>
            <Text style={[styles.nameText, { color: isDark ? '#fff' : '#000' }]}>
              Ready to learn?
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image
              source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}` }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>12</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Due Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>85%</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Retention</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1a1b1e' : '#fff' }]}>
            <Text style={[styles.statNumber, { color: isDark ? '#fff' : '#000' }]}>
              {categories.reduce((total, cat) => total + cat.count, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#aaa' : '#666' }]}>Total Cards</Text>
          </View>
        </View>

        {/* Categories Header */}
        <View style={styles.categoriesHeader}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>Categories</Text>
          <TouchableOpacity
            style={[styles.addCategoryButton, { backgroundColor: '#6c5ce7' }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.addCategoryButtonText}>Add Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Categories Section */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.categoriesGrid}
          contentContainerStyle={styles.categoriesContainer}
          ListEmptyComponent={ListEmptyComponent}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </View>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.studyButton, { backgroundColor: '#6c5ce7' }]}
          onPress={() => router.push('/decks')}
        >
          <Text style={styles.studyButtonText}>Start Studying</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#1a1b1e' : '#fff' }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#fff' : '#000' }
              ]}>
                Add New Category
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#2a2b2e' : '#f5f5f5',
                  color: isDark ? '#fff' : '#000',
                }
              ]}
              placeholder="Category Name"
              placeholderTextColor={isDark ? '#888' : '#666'}
              value={newCategory.title}
              onChangeText={(text) => setNewCategory({ ...newCategory, title: text })}
            />

            <Text style={[
              styles.iconSectionTitle,
              { color: isDark ? '#fff' : '#000' }
            ]}>
              Select Icon
            </Text>
            <View style={styles.iconGrid}>
              {icons.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    {
                      backgroundColor: newCategory.icon === icon
                        ? '#6c5ce7'
                        : isDark ? '#2a2b2e' : '#f5f5f5'
                    }
                  ]}
                  onPress={() => setNewCategory({ ...newCategory, icon })}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#6c5ce7' }]}
              onPress={handleAddCategory}
            >
              <Text style={styles.addButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    opacity: 0.8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  addCategoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesGrid: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  categoryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  studyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  studyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  iconSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  addButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  headerSection: {
    padding: 16,
    paddingBottom: 0,
  },
  categoriesSection: {
    flex: 1,
    marginBottom: 8,
  },
  categoriesContainer: {
    padding: 16,
    paddingTop: 0,
  },
  footer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 