import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styling
import axios from 'axios'; // Axios for API calls
import { FaEdit } from 'react-icons/fa'; // Import the edit icon
import './App.css';

function App() {
  const [title, setTitle] = useState(''); // State for note title
  const [note, setNote] = useState('');   // State for note content (Rich Text)
  const [notes, setNotes] = useState([]); // List of notes
  const [expandedNoteIndex, setExpandedNoteIndex] = useState(null); // State to track expanded note
  const [editingNoteIndex, setEditingNoteIndex] = useState(null); // State to track the note being edited
  const [editContent, setEditContent] = useState(''); // State for the content of the note being edited
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Fetch all notes when component loads
  useEffect(() => {
    fetchNotes();
  }, []);

  // Fetch all notes from the backend
  const fetchNotes = async () => {
    try {
      const response = await axios.get('/notes'); // API call to fetch notes
      setNotes(response.data); // Set the notes state with the fetched data
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  // Add a new note by making an API call
  const addNote = async () => {
    if (title.trim() && note.trim()) {
      try {
        const response = await axios.post('/notes', {
          title,
          content: note
        });
        setNotes([...notes, response.data]); // Add the new note to the state
        setTitle(''); // Clear the title input after adding
        setNote('');  // Clear the rich text content after adding
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  // Update a note by making an API call
  const saveEdit = async (index) => {
    const noteId = notes[index]._id; // Assume note has a MongoDB _id field
    try {
      const response = await axios.put(`/notes/${noteId}`, {
        title: notes[index].title,
        content: editContent
      });
      const updatedNotes = [...notes];
      updatedNotes[index] = response.data; // Update the note in the state
      setNotes(updatedNotes);
      setEditingNoteIndex(null); // Exit editing mode
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  // Delete a note by making an API call
  const removeNote = async (index) => {
    const noteId = notes[index]._id; // Assume note has a MongoDB _id field
    try {
      await axios.delete(`/notes/${noteId}`);
      const updatedNotes = notes.filter((_, i) => i !== index); // Remove the note from the state
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Handle text input change for the title
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter notes based on the search query (searching both title and content)
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle expand/collapse functionality
  const toggleExpand = (index) => {
    setExpandedNoteIndex(expandedNoteIndex === index ? null : index); // Toggle the expanded state
  };

  // Enable editing mode for a specific note and auto-expand it
  const startEditing = (index) => {
    setExpandedNoteIndex(index); // Automatically expand the note
    setEditingNoteIndex(index);
    setEditContent(notes[index].content); // Load the current content into the editor
  };

  return (
    <div className="App">
      <div className="container">
        {/* Notes section (left) */}
        <div className="notes-container">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search Notes..."
            className="search-bar"
            value={searchQuery}
            onChange={handleSearchChange}
          />

          {filteredNotes.length === 0 ? (
            <p className="no-notes-message">No Notes!</p>
          ) : (
            <ul>
              {filteredNotes.map((note, index) => (
                <li key={index} className="note-item">
                  <div className="note-header">
                    <span className="note-title">{note.title}</span>
                    <div className="note-buttons">
                      <button className="expand-note-btn" onClick={() => toggleExpand(index)}>
                        {expandedNoteIndex === index ? 'Collapse' : 'Expand'}
                      </button>
                      <FaEdit className="edit-note-icon" onClick={() => startEditing(index)} /> {/* Edit icon */}
                      <button className="remove-note-btn" onClick={() => removeNote(index)}>Remove</button>
                    </div>
                  </div>
                  {expandedNoteIndex === index && (
                    <div className="note-content">
                      {editingNoteIndex === index ? (
                        <>
                          <ReactQuill
                            value={editContent}
                            onChange={setEditContent} // Edit content
                            modules={{
                              toolbar: [
                                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                                [{ size: [] }],
                                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                ['link', 'image'],
                                ['clean'] // remove formatting button
                              ],
                            }}
                          />
                          <button className="save-note-btn" onClick={() => saveEdit(index)}>Save</button>
                          <button className="cancel-edit-btn" onClick={() => setEditingNoteIndex(null)}>Cancel</button>
                        </>
                      ) : (
                        <p dangerouslySetInnerHTML={{ __html: note.content }} /> /* Display rich text content */
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input area for note title and rich text editor (right) */}
        <div className="input-container">
          <label htmlFor="note-title" className="note-title-label">Note Title</label>
          <input
            id="note-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Enter the note title"
            className="note-title-input"
          />

          {/* Rich Text Editor for Note Content */}
          <ReactQuill
            value={note}
            onChange={setNote} // Store rich text content
            placeholder="Enter your note content"
            modules={{
              toolbar: [
                [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                [{ size: [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean'] // remove formatting button
              ],
            }}
            formats={[
              'header', 'font', 'size',
              'bold', 'italic', 'underline',
              'strike', 'blockquote',
              'list', 'bullet',
              'link', 'image'
            ]}
          />

          {/* Add Note Button below the editor */}
          <button className="add-note-btn" onClick={addNote}>Add Note</button>
        </div>
      </div>
    </div>
  );
}

export default App;
