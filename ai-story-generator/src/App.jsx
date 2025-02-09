import "./app.css"; // Import the CSS file
import React, { useState, useEffect } from "react";

const StoryGenerator = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [storyType, setStoryType] = useState("");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      } else {
        setTimeout(loadVoices, 500); // Retry if voices are not available
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const generateStory = async () => {
    if (!name.trim() || !age.trim() || !storyType.trim()) return; // Prevent empty inputs
    setLoading(true);
    setStory("");

    // Constructing a structured prompt
    const userPrompt = `Create a captivating ${storyType} story for a ${age}-year-old child named ${name}. The story should be engaging, imaginative, and suitable for their age. Keep it fun, adventurous, and full of surprises!`;

    try {
      const response = await fetch("http://localhost:8080/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();
      setStory(data.story);
    } catch (error) {
      console.error("Error generating story:", error);
      setStory("Failed to generate story. Please try again.");
    }
    setLoading(false);
  };

  const narrateStory = () => {
    if (!story) return;

    // Cancel ongoing speech to prevent conflicts
    if (window.speechSynthesis.speaking) {
      console.warn("Speech already in progress. Stopping and restarting.");
      window.speechSynthesis.cancel(); // Ensure a clean start
      setTimeout(narrateStory, 500); // Retry after a short delay
      return;
    }

    const speech = new SpeechSynthesisUtterance(story);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    // Ensure voice selection works
    let selectedVoice = voices.find(voice => voice.name.includes("Google")) || voices[0];

    if (!selectedVoice || voices.length === 0) {
      console.warn("Voices not loaded yet, retrying...");
      setTimeout(narrateStory, 500); // Retry after delay
      return;
    }

    speech.voice = selectedVoice;

    // Prevent garbage collection by keeping reference
    window.currentSpeech = speech;

    // Handle errors
    speech.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
    };

    // Ensure speech completes
    speech.onend = () => {
      console.log("Speech completed.");
    };

    // Speak only after ensuring speech API is ready
    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, 200);
  };

  return (
    <div className="full-screen-container">
      <div className="card-custom">
        {/* <h1>Magical AI Bedtime Stories</h1> */}
        <h1>Magical AI Bedtime Stories
        </h1>
        <p>– Personalized Tales for Little Dreamers</p>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="text"
            placeholder="Enter child's name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="number"
            placeholder="Enter child's age..."
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            className="form-control-custom"
            type="text"
            placeholder="Enter story type (e.g., adventure, fairy tale, mystery)..."
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
          />
        </div>

        <button
          className="btn-custom"
          onClick={generateStory}
          disabled={loading || !name.trim() || !age.trim() || !storyType.trim()}
        >
          {loading ? "Generating..." : "Generate Story"}
        </button>

        {story && (
          <div className="generated-story">
            <h5>Generated Story:</h5>
            <p>{story}</p>
            
          </div>
        )}
        <button className="btn-custom mt-3" onClick={narrateStory}>Narrate Story</button>
      </div>
    </div>
  );
};

export default StoryGenerator;
