import { useState, useCallback } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  MarkerType, // <-- Import MarkerType for arrowheads
  type Node,
  type Connection,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import TaskNode from './TaskNode';
import WorkspacePanel from './WorkspacePanel';
import ZoomSlider from './ZoomSlider';
import API_BASE_URL from './config';

const nodeTypes = {
  custom: CustomNode,
  tasks: TaskNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: {
      label: 'My New Business Idea',
      icon: '💡',
      color: '#A855F7', // A nice purple color
      agentName: 'Starting Point',
    },
    position: { x: 250, y: 5 },
  },
];

let id = 2;
const getUniqueId = () => `${id++}`;

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
  const [menu, setMenu] = useState<any>(null);
  const [selectionModal, setSelectionModal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personaModal, setPersonaModal] = useState<{ show: boolean; sourceNode: any } | null>(null);
  const [modeModal, setModeModal] = useState<{ show: boolean; sourceNode: any } | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('keyword');
  const [secondaryInput, setSecondaryInput] = useState<string>('');
  const [startFreshModal, setStartFreshModal] = useState<{ show: boolean; sourceNode: any } | null>(null);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation(); // Prevent triggering pane click
      const pane = (event.target as HTMLElement).closest('.react-flow');
      if (!pane) return;
      const bounds = pane.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY - bounds.top,
        left: event.clientX - bounds.left,
        data: node.data,
        position: node.position,
      });
    },
    [setMenu],
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectionModal(null);
  }, [setMenu, setSelectionModal]);

  const handleAgentInvoke = async (agentType: string, sourceNode: any, customPrompt?: string, persona?: string, mode?: string, secondaryPrompt?: string) => {
    setMenu(null);
    setIsLoading(true);
    const endpoint = `${API_BASE_URL}/${agentType}`;
    const promptToSend = customPrompt || sourceNode.data.label;
    
    try {
      // For brainstorm agent with new 6-mode API
      if (agentType === 'brainstorm' && mode) {
        const requestBody: any = {
          mode: mode,
          persona: persona || 'hackathon',
          user_input: promptToSend
        };
        
        // Add secondary input for merge mode
        if (mode === 'merge' && secondaryPrompt) {
          requestBody.user_input_2 = secondaryPrompt;
        }
        
        const response = await fetch(endpoint, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(requestBody) 
        });
        
        if (!response.ok) {
          throw new Error(`Brainstorm request failed: ${response.status}`);
        }
        
        if (!response.body) throw new Error("Response has no body");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        // Read the stream
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
        
        // Create a new node with the response
        const newNodeId = getUniqueId();
        const modeEmoji: {[key:string]: string} = {
          keyword: '💡',
          expand: '🌿', 
          merge: '🔀',
          analyze: '📊',
          score: '⭐',
          refine: '✨'
        };
        
        const newNode: Node = { 
          id: newNodeId, 
          type: 'custom', 
          className: 'new-node', 
          data: { 
            label: fullResponse, 
            icon: modeEmoji[mode] || '🧠',
            color: '#8b5cf6', 
            agentName: `Brainstormer (${mode})` 
          }, 
          position: { x: sourceNode.position.x + 50, y: sourceNode.position.y + 200 } 
        };
        
        const newEdge: Edge = { 
          id: `e-${sourceNode.id}-${newNodeId}`, 
          source: sourceNode.id, 
          target: newNodeId, 
          type: 'smoothstep', 
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } 
        };
        
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat(newEdge));
        
        // Auto-generate critic for all modes
        try {
          const criticResponseStream = await fetch(`${API_BASE_URL}/criticize`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ prompt: fullResponse }) 
          });
          
          if (criticResponseStream.body) {
            const criticNodeId = getUniqueId();
            const criticNode: Node = { 
              id: criticNodeId, 
              type: 'custom', 
              className: 'new-node thinking', 
              data: { label: '', icon: '🧐', color: '#f87171', agentName: 'Critic' }, 
              position: { x: newNode.position.x + 400, y: newNode.position.y } 
            };
            const criticEdge: Edge = { 
              id: `e-${newNodeId}-${criticNodeId}`, 
              source: newNodeId, 
              target: criticNodeId, 
              type: 'smoothstep', 
              markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } 
            };
            
            setNodes((nds) => nds.concat(criticNode));
            setEdges((eds) => eds.concat(criticEdge));
            
            const criticReader = criticResponseStream.body.getReader();
            let criticFullResponse = '';
            
            while (true) {
              const { value, done } = await criticReader.read();
              if (done) break;
              criticFullResponse += new TextDecoder().decode(value);
              setNodes((currentNodes) => currentNodes.map((node) => 
                node.id === criticNodeId ? { ...node, data: { ...node.data, label: criticFullResponse } } : node
              ));
            }
            
            setNodes((currentNodes) => currentNodes.map((node) => 
              node.id === criticNodeId ? { ...node, className: 'new-node' } : node
            ));
          }
        } catch (error) {
          console.error('Critic generation failed:', error);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Legacy format for other agents or old brainstorm calls
      const finalPrompt = persona ? `[PERSONA: ${persona}]\n${promptToSend}` : promptToSend;
      
      if (agentType === 'roadmap') {
        // Stream the roadmap response
        const response = await fetch(endpoint, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ prompt: promptToSend }) 
        });
        
        if (!response.ok) {
          throw new Error(`Roadmap request failed: ${response.status}`);
        }
        
        if (!response.body) throw new Error("Response has no body");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        // Read the stream completely first
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
        
        console.log('Roadmap full response:', fullResponse);
        
        // Now parse the complete response - look for "Phase" lines
        const phases = fullResponse.split('\n').filter(line => /^Phase\s+\d+:/i.test(line.trim()));
        
        console.log('Parsed phases:', phases);
        
        if (phases.length === 0) {
          throw new Error('No phases found in roadmap response');
        }
        
        let previousNodeId = sourceNode.id;
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        phases.forEach((phase: string, index: number) => {
          const parts = phase.split('::');
          const title = parts[0]?.trim() || `Phase ${index + 1}`;
          const description = parts[1]?.trim() || '';
          
          const newNodeId = getUniqueId();
          const newNode: Node = { 
            id: newNodeId, 
            className: 'new-node', 
            type: 'custom', 
            data: { 
              label: `${title}\n\n${description}`, 
              icon: '🗺️', 
              color: '#3b82f6', 
              agentName: 'Roadmap' 
            }, 
            position: { x: sourceNode.position.x, y: sourceNode.position.y + 200 * (index + 1) } 
          };
          newNodes.push(newNode);
          
          const newEdge: Edge = { 
            id: `e-${previousNodeId}-${newNodeId}`, 
            source: previousNodeId, 
            target: newNodeId, 
            type: 'smoothstep', 
            markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } 
          };
          newEdges.push(newEdge);
          previousNodeId = newNodeId;
        });
        
        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));

      } else if (agentType === 'pitchdeck') {
        // Special handling for pitch deck: collect all roadmap nodes and connect them
        const roadmapNodes = nodes.filter(node => node.data.icon === '🗺️');
        
        if (roadmapNodes.length === 0) {
          throw new Error('No roadmap found. Generate a roadmap first!');
        }
        
        // Calculate pitch deck position (below all roadmap nodes, centered)
        const avgX = roadmapNodes.reduce((sum, node) => sum + node.position.x, 0) / roadmapNodes.length;
        const maxY = Math.max(...roadmapNodes.map(node => node.position.y));
        
        const pitchDeckNodeId = getUniqueId();
        const pitchDeckNode: Node = { 
          id: pitchDeckNodeId, 
          type: 'custom', 
          className: 'new-node thinking', 
          data: { 
            label: '', 
            icon: '📊', 
            color: '#f59e0b', 
            agentName: 'Pitch Deck' 
          }, 
          position: { x: avgX, y: maxY + 250 } 
        };
        
        // Create edges from ALL roadmap nodes to pitch deck
        const pitchDeckEdges: Edge[] = roadmapNodes.map(roadmapNode => ({
          id: `e-${roadmapNode.id}-${pitchDeckNodeId}`,
          source: roadmapNode.id,
          target: pitchDeckNodeId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' }
        }));
        
        setNodes((nds) => nds.concat(pitchDeckNode));
        setEdges((eds) => eds.concat(pitchDeckEdges));
        
        // Gather context from all roadmap nodes
        const roadmapContext = roadmapNodes.map(node => node.data.label).join('\n\n');
        const pitchPrompt = `Based on this roadmap:\n\n${roadmapContext}\n\nCreate a compelling investor pitch deck.`;
        
        // Stream the pitch deck response
        const response = await fetch(endpoint, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ prompt: pitchPrompt }) 
        });
        
        if (!response.body) throw new Error("Response has no body");
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
          setNodes((currentNodes) => currentNodes.map((node) => 
            node.id === pitchDeckNodeId ? { ...node, data: { ...node.data, label: fullResponse } } : node
          ));
        }
        
        // Remove 'thinking' class and add download button
        setNodes((currentNodes) => currentNodes.map((node) => 
          node.id === pitchDeckNodeId ? { 
            ...node, 
            className: 'new-node',
            data: { ...node.data, label: fullResponse, downloadable: true, pitchDeckId: pitchDeckNodeId }
          } : node
        ));

      } else {
        const firstNodeId = getUniqueId();
        let icon = '💡';
        let color = '#fff';
        let agentName = 'Refined Idea';
        let nodeType = 'custom';
        
        if (customPrompt) { icon = '💬'; color = '#c084fc'; }
        else if (agentType === 'brainstorm') { icon = '🧠'; color = '#2dd4bf'; agentName = 'Brainstormer'; }
        else if (agentType === 'criticize') { icon = '🧐'; color = '#f87171'; agentName = 'Critic'; }
        else if (agentType === 'tasks') { icon = '✅'; color = '#10b981'; agentName = 'Action Plan'; nodeType = 'tasks'; }
        else if (agentType === 'pitchdeck') { icon = '📊'; color = '#f59e0b'; agentName = 'Pitch Deck'; }

        const firstNewNode: Node = { id: firstNodeId, type: nodeType, className: 'new-node thinking', data: { label: '', icon, color, agentName }, position: { x: sourceNode.position.x, y: sourceNode.position.y + 200 } };
        const firstNewEdge: Edge = { id: `e-${sourceNode.id}-${firstNodeId}`, source: sourceNode.id, target: firstNodeId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } };
        setNodes((nds) => nds.concat(firstNewNode));
        setEdges((eds) => eds.concat(firstNewEdge));

        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: finalPrompt }) });
        if (!response.body) throw new Error("Response has no body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
          setNodes((currentNodes) => currentNodes.map((node) => node.id === firstNodeId ? { ...node, data: { ...node.data, label: fullResponse } } : node));
        }
        
        // Remove 'thinking' class after stream is complete
        setNodes((currentNodes) => currentNodes.map((node) => node.id === firstNodeId ? { ...node, className: 'new-node' } : node));
        
        if (agentType === 'brainstorm' && !customPrompt) {
            const criticResponseStream = await fetch(`${API_BASE_URL}/criticize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: fullResponse }) });
            if (!criticResponseStream.body) return;
            const criticNodeId = getUniqueId();
            const criticNode: Node = { id: criticNodeId, type: 'custom', className: 'new-node thinking', data: { label: '', icon: '🧐', color: '#f87171', agentName: 'Critic' }, position: { x: firstNewNode.position.x + 400, y: firstNewNode.position.y } };
            const criticEdge: Edge = { id: `e-${firstNewNode.id}-${criticNodeId}`, source: firstNewNode.id, target: criticNodeId, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } };
            setNodes((nds) => nds.concat(criticNode));
            setEdges((eds) => eds.concat(criticEdge));
            const criticReader = criticResponseStream.body.getReader();
            let criticFullResponse = '';
            while (true) {
                const { value, done } = await criticReader.read();
                if (done) break;
                criticFullResponse += decoder.decode(value);
                setNodes((currentNodes) => currentNodes.map((node) => node.id === criticNodeId ? { ...node, data: { ...node.data, label: criticFullResponse } } : node));
            }
            // Remove 'thinking' class from critic node
            setNodes((currentNodes) => currentNodes.map((node) => node.id === criticNodeId ? { ...node, className: 'new-node' } : node));
        }
      }
    } catch (error) {
      console.error("Error calling AI agent:", error);
      alert("Failed to get a response from the AI agent. Make sure your backend is running!");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSelectIdea = () => {
    if (!menu) return;
    const ideas = menu.data.label.split('\n').map((line: string) => line.trim()).filter((line: string) => /^\d/.test(line));
    if (ideas.length > 0) {
      setSelectionModal({ sourceNode: { id: menu.id, position: menu.position }, ideas: ideas });
    } else {
      handleCreateFocusedNode(menu.data.label);
    }
    setMenu(null);
  };

  const handleCreateFocusedNode = (selectedIdea: string) => {
    if (!selectionModal && !menu) return;
    const sourceNode = selectionModal ? selectionModal.sourceNode : menu;
    const cleanedLabel = selectedIdea.replace(/^\d+\.\s*/, '').trim();
    const newNode: Node = { id: getUniqueId(), type: 'custom', className: 'new-node', data: { label: cleanedLabel, icon: '🎯', color: '#facc15', agentName: 'Focused Idea' }, position: { x: sourceNode.position.x, y: sourceNode.position.y + 200 } };
    const newEdge: Edge = { id: `e-${sourceNode.id}-${newNode.id}`, source: sourceNode.id, target: newNode.id, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: '#a1a1aa' } };
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat(newEdge));
    setSelectionModal(null);
  };

  // Workspace management handlers
  const handleLoadCanvas = (loadedNodes: Node[], loadedEdges: Edge[]) => {
    setNodes(loadedNodes);
    setEdges(loadedEdges);
    // Update the id counter to avoid conflicts
    const maxId = Math.max(...loadedNodes.map(n => parseInt(n.id) || 0), 1);
    id = maxId + 1;
  };

  const handleNewCanvas = () => {
    setNodes(initialNodes);
    setEdges([]);
    id = 2; // Reset ID counter
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {/* Workspace Panel */}
      <WorkspacePanel 
        currentNodes={nodes}
        currentEdges={edges}
        onLoadCanvas={handleLoadCanvas}
        onNewCanvas={handleNewCanvas}
      />
      
      <div className="app-header">
        <h1 className="app-title">
          <span className="title-icon">🎨</span>
          Cognitive Canvas
          <span className="title-subtitle">AI-Powered Idea Studio</span>
        </h1>
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.2}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background 
            gap={20} 
            size={2} 
            color="#94a3b8"
          />
        </ReactFlow>

        {/* Custom Zoom Slider */}
        <ZoomSlider />

        {isLoading && (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <span>AI agent is thinking...</span>
            </div>
        )}

        {menu && (
          <div style={{ top: menu.top, left: menu.left }} className="context-menu">
            <p className="context-menu-header">Actions</p>
            {menu.data.agentName === 'Starting Point' && (
              <button onClick={() => {
                setStartFreshModal({ show: true, sourceNode: {id: menu.id, data: menu.data, position: menu.position} });
                setMenu(null);
              }}>
                🚀 Start Fresh (Generate New Ideas)
              </button>
            )}
            {menu.data.agentName !== 'Starting Point' && (menu.data.icon === '🎯' || menu.data.icon === '🧠' || menu.data.icon === '🔀' || menu.data.icon === '📊' || menu.data.icon === '⭐' || menu.data.icon === '✨') && (
              <button onClick={() => {
                setModeModal({ show: true, sourceNode: {id: menu.id, data: menu.data, position: menu.position} });
                setMenu(null);
              }}>
                🧠 Work with This Idea (5 Modes)
              </button>
            )}
            {menu.data.agentName !== 'Starting Point' && (menu.data.icon === '🧠' || menu.data.icon === '💡' || menu.data.icon === '🌿' || menu.data.icon === '🔀' || menu.data.icon === '📊' || menu.data.icon === '⭐' || menu.data.icon === '✨' || menu.data.icon === '🎯') && (
              <button onClick={handleSelectIdea}>
                ✨ Select & Expand Idea
              </button>
            )}
            {menu.data.agentName !== 'Starting Point' && (
              <button onClick={() => handleAgentInvoke('criticize', {id: menu.id, data: menu.data, position: menu.position})}>
                🧐 Criticize
              </button>
            )}
            {menu.data.agentName !== 'Starting Point' && (menu.data.icon === '🎯' || menu.data.icon === '🧠' || menu.data.icon === '🔀' || menu.data.icon === '📊' || menu.data.icon === '⭐' || menu.data.icon === '✨') && (
              <button onClick={() => handleAgentInvoke('roadmap', {id: menu.id, data: menu.data, position: menu.position})}>
                🗺️ Generate Roadmap
              </button>
            )}
            {menu.data.icon === '🗺️' && (
              <button onClick={() => handleAgentInvoke('tasks', {id: menu.id, data: menu.data, position: menu.position})}>
                ✅ Break Down Tasks
              </button>
            )}
            {menu.data.icon === '🗺️' && (
              <button onClick={() => handleAgentInvoke('pitchdeck', {id: menu.id, data: menu.data, position: menu.position})}>
                📊 Generate Pitch Deck
              </button>
            )}
          </div>
        )}
        
        {selectionModal && (
          <div className="selection-modal-overlay">
            <div className="selection-modal">
              <h3>Select an Idea to Expand</h3>
              <div className="idea-list">
                {selectionModal.ideas.map((idea: string, index: number) => (
                  <button key={index} onClick={() => handleCreateFocusedNode(idea)}>
                    {idea}
                  </button>
                ))}
              </div>
              <button className="close-button" onClick={() => setSelectionModal(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Start Fresh Modal - Direct to Personas */}
        {startFreshModal?.show && (
          <div className="selection-modal-overlay">
            <div className="persona-modal">
              <h3>🚀 Start Fresh - Generate New Ideas</h3>
              <p className="persona-subtitle">Pick your profile and we'll generate 3 startup ideas based on a keyword</p>
              <div className="persona-options">
                <button 
                  className="persona-card"
                  onClick={() => {
                    const topic = prompt('💡 Enter a keyword or topic:\n(e.g., AI, fitness, education, sustainability, blockchain)');
                    if (topic && topic.trim()) {
                      const updatedSourceNode = { ...startFreshModal.sourceNode, data: { ...startFreshModal.sourceNode.data, label: topic.trim() } };
                      handleAgentInvoke('brainstorm', updatedSourceNode, undefined, 'student', 'keyword', '');
                      setStartFreshModal(null);
                    }
                  }}
                >
                  <div className="persona-icon">🎓</div>
                  <div className="persona-title">Student</div>
                  <div className="persona-desc">Low budget ($0-200), part-time, campus-relevant ideas</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    const topic = prompt('💡 Enter a keyword or industry:\n(e.g., B2B SaaS, fintech, healthcare, e-commerce, Web3)');
                    if (topic && topic.trim()) {
                      const updatedSourceNode = { ...startFreshModal.sourceNode, data: { ...startFreshModal.sourceNode.data, label: topic.trim() } };
                      handleAgentInvoke('brainstorm', updatedSourceNode, undefined, 'entrepreneur', 'keyword', '');
                      setStartFreshModal(null);
                    }
                  }}
                >
                  <div className="persona-icon">💼</div>
                  <div className="persona-title">Entrepreneur</div>
                  <div className="persona-desc">High-growth potential, B2B/SaaS, leverages experience</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    const topic = prompt('💡 Enter a tech or theme:\n(e.g., AI, Web3, climate tech, AR/VR, IoT, DevTools)');
                    if (topic && topic.trim()) {
                      const updatedSourceNode = { ...startFreshModal.sourceNode, data: { ...startFreshModal.sourceNode.data, label: topic.trim() } };
                      handleAgentInvoke('brainstorm', updatedSourceNode, undefined, 'hackathon', 'keyword', '');
                      setStartFreshModal(null);
                    }
                  }}
                >
                  <div className="persona-icon">⚡</div>
                  <div className="persona-title">Hackathon</div>
                  <div className="persona-desc">Buildable in 24-48 hours, impressive demo, wow factor</div>
                </button>
              </div>
              <button className="close-button" onClick={() => setStartFreshModal(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Mode Selection Modal (Step 1) - For Working with Existing Ideas */}
        {modeModal?.show && (
          <div className="selection-modal-overlay">
            <div className="persona-modal" style={{maxWidth: '900px'}}>
              <h3>🎯 Choose How to Work with Your Idea</h3>
              <p className="persona-subtitle">Current idea: "{modeModal.sourceNode.data.label.substring(0, 50)}..."</p>
              <div className="persona-options" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    setSelectedMode('expand');
                    setModeModal(null);
                    setPersonaModal({ show: true, sourceNode: modeModal.sourceNode });
                  }}
                >
                  <div className="persona-icon">🌿</div>
                  <div className="persona-title">Expand</div>
                  <div className="persona-desc">Branch out 3 variations from your existing idea</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    setSelectedMode('merge');
                    setModeModal(null);
                    // For merge mode, we need secondary input - show a prompt first
                    const secondIdea = prompt('Enter the SECOND idea to merge with your current idea:');
                    if (secondIdea) {
                      setSecondaryInput(secondIdea);
                      setPersonaModal({ show: true, sourceNode: modeModal.sourceNode });
                    } else {
                      setModeModal({ show: true, sourceNode: modeModal.sourceNode });
                    }
                  }}
                >
                  <div className="persona-icon">🔀</div>
                  <div className="persona-title">Merge</div>
                  <div className="persona-desc">Combine your idea with another one into powerful hybrid</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    setSelectedMode('analyze');
                    setModeModal(null);
                    setPersonaModal({ show: true, sourceNode: modeModal.sourceNode });
                  }}
                >
                  <div className="persona-icon">📊</div>
                  <div className="persona-title">Analyze</div>
                  <div className="persona-desc">Market analysis, competitors, go-to-market strategy</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    setSelectedMode('score');
                    setModeModal(null);
                    setPersonaModal({ show: true, sourceNode: modeModal.sourceNode });
                  }}
                >
                  <div className="persona-icon">⭐</div>
                  <div className="persona-title">Score</div>
                  <div className="persona-desc">Evaluate your idea across 5 dimensions + verdict</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    setSelectedMode('refine');
                    setModeModal(null);
                    setPersonaModal({ show: true, sourceNode: modeModal.sourceNode });
                  }}
                >
                  <div className="persona-icon">✨</div>
                  <div className="persona-title">Refine</div>
                  <div className="persona-desc">Transform your rough idea into polished pitch</div>
                </button>
              </div>
              <button className="close-button" onClick={() => setModeModal(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Persona Selection Modal (Step 2) */}
        {personaModal?.show && (
          <div className="selection-modal-overlay">
            <div className="persona-modal">
              <h3>🎯 Who are you?</h3>
              <p className="persona-subtitle">Get personalized ideas based on your profile</p>
              <div className="persona-options">
                <button 
                  className="persona-card"
                  onClick={() => {
                    handleAgentInvoke('brainstorm', personaModal.sourceNode, undefined, 'student', selectedMode, secondaryInput);
                    setPersonaModal(null);
                    setSecondaryInput('');
                  }}
                >
                  <div className="persona-icon">🎓</div>
                  <div className="persona-title">Student</div>
                  <div className="persona-desc">College student with limited time & budget</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    handleAgentInvoke('brainstorm', personaModal.sourceNode, undefined, 'entrepreneur', selectedMode, secondaryInput);
                    setPersonaModal(null);
                    setSecondaryInput('');
                  }}
                >
                  <div className="persona-icon">💼</div>
                  <div className="persona-title">Entrepreneur</div>
                  <div className="persona-desc">Experienced founder looking for next venture</div>
                </button>
                
                <button 
                  className="persona-card"
                  onClick={() => {
                    handleAgentInvoke('brainstorm', personaModal.sourceNode, undefined, 'hackathon', selectedMode, secondaryInput);
                    setPersonaModal(null);
                    setSecondaryInput('');
                  }}
                >
                  <div className="persona-icon">⚡</div>
                  <div className="persona-title">Hackathon</div>
                  <div className="persona-desc">Quick prototype for 24-48 hour project</div>
                </button>
              </div>
              <button className="close-button" onClick={() => setPersonaModal(null)}>Cancel</button>
            </div>
          </div>
        )}

      </ReactFlowProvider>
    </div>
  );
};
export default App;
