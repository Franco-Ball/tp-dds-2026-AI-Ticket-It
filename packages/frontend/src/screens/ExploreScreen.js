import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { eventoService } from "../services/eventoService";
import { categoriaService } from "../services/categoriaService";
import { useDebounce } from "../hooks/useDebounce";
import EventCard from "../components/events/EventCard";
import CategoryPills from "../components/events/CategoryPills";
import SortModal, { SORT_OPTIONS } from "../components/events/SortModal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { colors, spacing, borderRadius } from "../theme/theme";

export default function ExploreScreen() {
  const navigation = useNavigation();

  // Estados de datos
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 350);
  const [selectedCategoria, setSelectedCategoria] = useState("TODAS");
  const [currentSort, setCurrentSort] = useState({ sortBy: "fecha", order: "asc" });

  // Estados de control UI
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Cargar categorías iniciales
  useEffect(() => {
    let isMounted = true;
    async function fetchCategorias() {
      try {
        const data = await categoriaService.listarCategorias();
        if (isMounted && Array.isArray(data)) {
          setCategorias(data);
        }
      } catch {
        // Error silencioso, las categorías mostrarán 'Todas'
      }
    }
    fetchCategorias();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar eventos con los filtros actuales
  const cargarEventos = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const data = await eventoService.listarEventos({
        q: debouncedSearch,
        categoria: selectedCategoria,
        sortBy: currentSort.sortBy,
        order: currentSort.order,
      });

      if (Array.isArray(data)) {
        setEventos(data);
      } else {
        setEventos([]);
      }
    } catch (err) {
      setError(err?.message || "No se pudo obtener el catálogo de eventos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, selectedCategoria, currentSort]);

  // Efecto cuando cambian los filtros
  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarEventos(true);
  };

  const limpiarFiltros = () => {
    setSearchQuery("");
    setSelectedCategoria("TODAS");
    setCurrentSort({ sortBy: "fecha", order: "asc" });
  };

  // Obtener etiqueta legible del orden actual
  const getSortLabel = () => {
    const found = SORT_OPTIONS.find(
      (opt) => opt.sortBy === currentSort.sortBy && opt.order === currentSort.order
    );
    return found ? found.label : "Fecha";
  };

  const hayFiltrosActivos =
    searchQuery.trim().length > 0 ||
    selectedCategoria !== "TODAS" ||
    currentSort.sortBy !== "fecha" ||
    currentSort.order !== "asc";

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Barra de Búsqueda con Accesibilidad (WCAG) */}
      <View style={styles.searchBarWrapper}>
        <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por artista, evento o sala..."
          placeholderTextColor={colors.textSubtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Campo de búsqueda de eventos"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearSearchBtn}
            accessibilityRole="button"
            accessibilityLabel="Borrar texto de búsqueda"
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selector de Categorías (Pills deslizables) */}
      <CategoryPills
        categorias={categorias}
        selectedCategoriaId={selectedCategoria}
        onSelectCategoria={(catId) => setSelectedCategoria(catId)}
      />

      {/* Barra de Ordenamiento y Estado de Resultados */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {loading ? "Buscando..." : `${eventos.length} evento${eventos.length === 1 ? "" : "s"}`}
        </Text>

        <View style={styles.filterActions}>
          {hayFiltrosActivos && (
            <TouchableOpacity
              onPress={limpiarFiltros}
              style={styles.clearFiltersBtn}
              accessibilityRole="button"
              accessibilityLabel="Restablecer todos los filtros"
            >
              <Text style={styles.clearFiltersText}>Limpiar</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`Ordenar eventos. Actualmente: ${getSortLabel()}`}
          >
            <Feather name="sliders" size={14} color={colors.primaryDark} />
            <Text style={styles.sortButtonText} numberOfLines={1}>
              {getSortLabel()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Manejo de los 4 estados de la UI (Clase 10) */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <LoadingState message="Cargando catálogo de espectáculos..." />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            {renderHeader()}
            <ErrorState message={error} onRetry={() => cargarEventos()} />
          </View>
        ) : eventos.length === 0 ? (
          <FlatList
            data={[]}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={
              <EmptyState
                icon="calendar"
                title="No hay eventos disponibles"
                description="No encontramos espectáculos con los criterios ingresados. Prueba cambiando la búsqueda o seleccionando otra categoría."
                actionLabel={hayFiltrosActivos ? "Limpiar Filtros" : undefined}
                onAction={hayFiltrosActivos ? limpiarFiltros : undefined}
              />
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryDark]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <EventCard
                evento={item}
                onPress={() => navigation.navigate("EventDetail", { eventoId: item.id })}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryDark]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Modal de Ordenamiento */}
        <SortModal
          visible={sortModalVisible}
          currentSort={currentSort}
          onClose={() => setSortModalVisible(false)}
          onApplySort={(nuevoOrden) => setCurrentSort(nuevoOrden)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48, // WCAG touch target
    marginBottom: spacing.xs,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: "100%",
  },
  clearSearchBtn: {
    padding: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
  },
  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  clearFiltersBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.error,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    maxWidth: 200,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
  },
});
