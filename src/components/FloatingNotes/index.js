import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  deleteNote,
  listNotes,
  saveNote,
} from "../../services/noteService";

import { getFavorites } from "../../services/userService";
import { adaptCarCard } from "../../utils/vehicleAdapters";

import styles from "./styles";

export default function FloatingNotes({ navigation }) {
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);

  const [viewMode, setViewMode] = useState("LIST");

  const [notes, setNotes] = useState([]);
  const [filteredSearch, setFilteredSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [cars, setCars] = useState([]);
  const [attachedCars, setAttachedCars] = useState([]);

  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listNotes();

      setNotes(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (e) {
      setError(
        e?.message ||
          "Não foi possível carregar as anotações."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCars = useCallback(async () => {
    try {
      const response =
        await getFavorites();

      const list =
        response?.favoriteCarros ||
        response ||
        [];

      setCars(
        Array.isArray(list)
          ? list.map(adaptCarCard)
          : []
      );
    } catch {
      setCars([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    loadNotes();
  }, [open, loadNotes]);

  const filteredNotes = useMemo(() => {
    const term =
      filteredSearch
        .trim()
        .toLowerCase();

    if (!term) {
      return notes;
    }

    return notes.filter((note) => {
      const text =
        `${note.title || ""} ${note.content || ""}`
          .toLowerCase();

      return text.includes(term);
    });
  }, [notes, filteredSearch]);

  function startNewNote() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setAttachedCars([]);
    setError("");

    loadCars();

    setViewMode("EDIT");
  }

  function editNote(note) {
    setEditingId(note.id);

    setTitle(
      note.title || ""
    );

    setContent(
      note.content || ""
    );

    setAttachedCars(
      note.attachedCars || []
    );

    setError("");

    loadCars();

    setViewMode("EDIT");
  }

  function goBackToList() {
    setViewMode("LIST");

    setEditingId(null);
    setTitle("");
    setContent("");
    setAttachedCars([]);
    setError("");
  }

  function close() {
    setOpen(false);

    setTimeout(() => {
      setViewMode("LIST");
      setEditingId(null);
      setExpandedNoteId(null);
      setError("");
    }, 150);
  }

  function toggleCar(car) {
    const exists =
      attachedCars.some(
        (item) =>
          String(item.id) ===
          String(car.id)
      );

    if (exists) {
      setAttachedCars((current) =>
        current.filter(
          (item) =>
            String(item.id) !==
            String(car.id)
        )
      );

      return;
    }

    setAttachedCars((current) => [
      ...current,
      car,
    ]);
  }

  async function handleSave() {
    if (
      !title.trim() &&
      !content.trim()
    ) {
      setError(
        "Informe ao menos um título ou conteúdo."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveNote({
        id: editingId,
        title:
          title.trim() ||
          "Sem título",
        content,
        attachedCars,
      });

      await loadNotes();

      goBackToList();
    } catch (e) {
      setError(
        e?.message ||
          "Não foi possível salvar a anotação."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId) {
    try {
      await deleteNote(noteId);

      setNotes((current) =>
        current.filter(
          (note) =>
            String(note.id) !==
            String(noteId)
        )
      );

      if (
        String(expandedNoteId) ===
        String(noteId)
      ) {
        setExpandedNoteId(null);
      }
    } catch (e) {
      setError(
        e?.message ||
          "Não foi possível excluir a anotação."
      );
    }
  }

  function navigateToCar(car) {
    close();

    navigation.navigate(
      "VehicleDetail",
      {
        lineageId: car.id,
        car,
      }
    );
  }

  return (
    <>
      {!open ? (
        <View
          pointerEvents="box-none"
          style={[
            styles.floatingContainer,
            {
              bottom:
                insets.bottom + 20,
            },
          ]}
        >
          <Pressable
            onPress={() =>
              setOpen(true)
            }
            style={({ pressed }) => [
              styles.floatingButton,
              pressed &&
                styles.floatingButtonPressed,
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={27}
              color="#00142E"
            />
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <View
          style={
            styles.backdrop
          }
        >
          <Pressable
            style={
              styles.backdropDismiss
            }
            onPress={close}
          />

          <View
            style={[
              styles.panel,
              {
                top:
                  insets.top + 14,
                bottom:
                  insets.bottom + 14,
              },
            ]}
          >
            {viewMode === "LIST" ? (
              <>
                <View
                  style={
                    styles.header
                  }
                >
                  <View
                    style={
                      styles.headerTitle
                    }
                  >
                    <View
                      style={
                        styles.headerIcon
                      }
                    >
                      <Ionicons
                        name="document-text-outline"
                        size={21}
                        color="#FFFFFF"
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.kicker
                        }
                      >
                        BCI NOTAS
                      </Text>

                      <Text
                        style={
                          styles.heading
                        }
                      >
                        Anotações
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.headerActions
                    }
                  >
                    <Pressable
                      onPress={
                        startNewNote
                      }
                      style={
                        styles.newButton
                      }
                    >
                      <Ionicons
                        name="add-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                      <Text
                        style={
                          styles.newButtonText
                        }
                      >
                        Nova
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={close}
                      style={
                        styles.iconButton
                      }
                    >
                      <Ionicons
                        name="close-outline"
                        size={22}
                        color="#00142E"
                      />
                    </Pressable>
                  </View>
                </View>

                <View
                  style={
                    styles.search
                  }
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color="#7D8793"
                  />

                  <TextInput
                    value={
                      filteredSearch
                    }
                    onChangeText={
                      setFilteredSearch
                    }
                    placeholder="Buscar nas anotações..."
                    placeholderTextColor="#9AA3AD"
                    style={
                      styles.searchInput
                    }
                  />
                </View>

                {error ? (
                  <Text
                    style={
                      styles.error
                    }
                  >
                    {error}
                  </Text>
                ) : null}

                {loading ? (
                  <View
                    style={
                      styles.loading
                    }
                  >
                    <ActivityIndicator
                      color="#00142E"
                    />
                  </View>
                ) : (
                  <ScrollView
                    contentContainerStyle={
                      styles.list
                    }
                    showsVerticalScrollIndicator={
                      false
                    }
                  >
                    {filteredNotes.length ===
                    0 ? (
                      <View
                        style={
                          styles.empty
                        }
                      >
                        <Ionicons
                          name="reader-outline"
                          size={42}
                          color="#8D99A5"
                        />

                        <Text
                          style={
                            styles.emptyTitle
                          }
                        >
                          Nenhuma anotação
                        </Text>

                        <Text
                          style={
                            styles.emptyText
                          }
                        >
                          Crie uma nota
                          sem sair da tela
                          atual.
                        </Text>

                        <Pressable
                          onPress={
                            startNewNote
                          }
                          style={
                            styles.emptyButton
                          }
                        >
                          <Text
                            style={
                              styles.emptyButtonText
                            }
                          >
                            Criar anotação
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      filteredNotes.map(
                        (note) => {
                          const expanded =
                            String(
                              expandedNoteId
                            ) ===
                            String(
                              note.id
                            );

                          return (
                            <Pressable
                              key={
                                note.id
                              }
                              onPress={() =>
                                setExpandedNoteId(
                                  expanded
                                    ? null
                                    : note.id
                                )
                              }
                              style={[
                                styles.noteCard,
                                expanded &&
                                  styles.noteCardExpanded,
                              ]}
                            >
                              <View
                                style={
                                  styles.noteHeader
                                }
                              >
                                <View
                                  style={
                                    styles.noteTitleRow
                                  }
                                >
                                  <Text
                                    numberOfLines={
                                      1
                                    }
                                    style={
                                      styles.noteTitle
                                    }
                                  >
                                    {note.title ||
                                      "Sem título"}
                                  </Text>

                                  <Ionicons
                                    name={
                                      expanded
                                        ? "chevron-up-outline"
                                        : "chevron-down-outline"
                                    }
                                    size={
                                      17
                                    }
                                    color="#7D8793"
                                  />
                                </View>

                                <View
                                  style={
                                    styles.quickActions
                                  }
                                >
                                  <Pressable
                                    onPress={() =>
                                      editNote(
                                        note
                                      )
                                    }
                                    style={
                                      styles.quickButton
                                    }
                                  >
                                    <Ionicons
                                      name="pencil-outline"
                                      size={
                                        17
                                      }
                                      color="#0562D2"
                                    />
                                  </Pressable>

                                  <Pressable
                                    onPress={() =>
                                      handleDelete(
                                        note.id
                                      )
                                    }
                                    style={
                                      styles.quickButton
                                    }
                                  >
                                    <Ionicons
                                      name="trash-outline"
                                      size={
                                        17
                                      }
                                      color="#C9434F"
                                    />
                                  </Pressable>
                                </View>
                              </View>

                              {!expanded ? (
                                <Text
                                  numberOfLines={
                                    2
                                  }
                                  style={
                                    styles.noteSnippet
                                  }
                                >
                                  {note.content ||
                                    "Nenhum texto informado..."}
                                </Text>
                              ) : (
                                <View
                                  style={
                                    styles.expandedContent
                                  }
                                >
                                  <Text
                                    style={
                                      styles.expandedText
                                    }
                                  >
                                    {note.content ||
                                      "Nenhum conteúdo."}
                                  </Text>

                                  {note
                                    .attachedCars
                                    ?.length ? (
                                    <View
                                      style={
                                        styles.attachedList
                                      }
                                    >
                                      {note.attachedCars.map(
                                        (
                                          car
                                        ) => (
                                          <Pressable
                                            key={
                                              car.id
                                            }
                                            onPress={() =>
                                              navigateToCar(
                                                car
                                              )
                                            }
                                            style={
                                              styles.attachedCar
                                            }
                                          >
                                            <Ionicons
                                              name="car-sport-outline"
                                              size={
                                                18
                                              }
                                              color="#0562D2"
                                            />

                                            <Text
                                              style={
                                                styles.attachedCarText
                                              }
                                            >
                                              {car.name ||
                                                `${car.brand || ""}`}
                                            </Text>

                                            <Ionicons
                                              name="open-outline"
                                              size={
                                                15
                                              }
                                              color="#7D8793"
                                            />
                                          </Pressable>
                                        )
                                      )}
                                    </View>
                                  ) : null}
                                </View>
                              )}
                            </Pressable>
                          );
                        }
                      )
                    )}
                  </ScrollView>
                )}
              </>
            ) : (
              <>
                <View
                  style={
                    styles.header
                  }
                >
                  <View
                    style={
                      styles.headerTitle
                    }
                  >
                    <Pressable
                      onPress={
                        goBackToList
                      }
                      style={
                        styles.iconButton
                      }
                    >
                      <Ionicons
                        name="arrow-back-outline"
                        size={21}
                        color="#00142E"
                      />
                    </Pressable>

                    <View>
                      <Text
                        style={
                          styles.kicker
                        }
                      >
                        {editingId
                          ? "EDITANDO NOTA"
                          : "NOVA NOTA"}
                      </Text>

                      <Text
                        numberOfLines={
                          1
                        }
                        style={
                          styles.heading
                        }
                      >
                        {title ||
                          "Sem título"}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={close}
                    style={
                      styles.iconButton
                    }
                  >
                    <Ionicons
                      name="close-outline"
                      size={22}
                      color="#00142E"
                    />
                  </Pressable>
                </View>

                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={
                    styles.editor
                  }
                  showsVerticalScrollIndicator={
                    false
                  }
                >
                  <TextInput
                    value={title}
                    onChangeText={
                      setTitle
                    }
                    placeholder="Título da anotação..."
                    placeholderTextColor="#A0A8B1"
                    style={
                      styles.titleInput
                    }
                    maxLength={100}
                  />

                  <TextInput
                    value={content}
                    onChangeText={
                      setContent
                    }
                    placeholder="Escreva sua anotação..."
                    placeholderTextColor="#A0A8B1"
                    multiline
                    textAlignVertical="top"
                    style={
                      styles.textarea
                    }
                  />

                  <View
                    style={
                      styles.sectionHeader
                    }
                  >
                    <Ionicons
                      name="car-sport-outline"
                      size={18}
                      color="#00142E"
                    />

                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      VINCULAR VEÍCULO
                    </Text>
                  </View>

                  {cars.length ? (
                    <View
                      style={
                        styles.carChips
                      }
                    >
                      {cars.map(
                        (car) => {
                          const selected =
                            attachedCars.some(
                              (
                                item
                              ) =>
                                String(
                                  item.id
                                ) ===
                                String(
                                  car.id
                                )
                            );

                          return (
                            <Pressable
                              key={
                                car.id
                              }
                              onPress={() =>
                                toggleCar(
                                  car
                                )
                              }
                              style={[
                                styles.carChip,
                                selected &&
                                  styles.carChipSelected,
                              ]}
                            >
                              <Ionicons
                                name={
                                  selected
                                    ? "checkmark-circle"
                                    : "add-circle-outline"
                                }
                                size={
                                  17
                                }
                                color={
                                  selected
                                    ? "#FFFFFF"
                                    : "#00142E"
                                }
                              />

                              <Text
                                style={[
                                  styles.carChipText,
                                  selected &&
                                    styles.carChipTextSelected,
                                ]}
                              >
                                {car.brand}{" "}
                                {car.name}
                              </Text>
                            </Pressable>
                          );
                        }
                      )}
                    </View>
                  ) : (
                    <Text
                      style={
                        styles.helper
                      }
                    >
                      Você ainda não
                      possui veículos
                      salvos.
                    </Text>
                  )}

                  {error ? (
                    <Text
                      style={
                        styles.error
                      }
                    >
                      {error}
                    </Text>
                  ) : null}

                  <Pressable
                    onPress={
                      handleSave
                    }
                    disabled={saving}
                    style={[
                      styles.saveButton,
                      saving &&
                        styles.saveButtonDisabled,
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="save-outline"
                          size={19}
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.saveButtonText
                          }
                        >
                          Salvar nota
                        </Text>
                      </>
                    )}
                  </Pressable>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}