import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Card, Form, Button, ListGroup, Badge, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export default function RagChatbot() {
    const [text, setText] = useState("")
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    // 1. STATE ADDITION: State to manage the session ID for the backend
    const [sessionId, setSessionId] = useState(null) 
    const { t } = useTranslation()
    
    // Ref for auto-scrolling
    const messagesEndRef = useRef(null);

    // Scroll to the latest message whenever the messages array updates
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Cleanup the unused example functions in useEffect
    useEffect(() => {
        console.log("Chatbot component mounted.")
    }, [])

    // Initialize greeting message using current language
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{ type: 'bot', content: t('chatbot.initialMessage') }])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t])

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const userMessage = text;
        setText('');
        
        // Add user message to state immediately
        setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const payload = { 
                query: userMessage,
                // --- CORRECTION 1: Match FastAPI Pydantic model field name: 'session_id' (snake_case) ---
                session_id: sessionId 
            };
            
            // --- CORRECTION 2: Match the endpoint URL used in api.py ---
            // Using absolute path for clarity, ensure the backend is running on 127.0.0.1:5002
            const res = await fetch("http://127.0.0.1:5002/api/chat", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // Handle 503 (Service Unavailable) specifically
                if (res.status === 503) {
                     throw new Error(`System is initializing. Try again later. (Status: 503)`);
                }
                // Handle 500 (Internal Server Error)
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            
            // CORRECTION: Update the session ID from the response if it's the first message
            if (!sessionId && data.session_id) {
                setSessionId(data.session_id);
            }

            setMessages(prev => [...prev, {
                type: 'bot',
                content: data.response || 'I could not process that request.',
                context: data.context // You might want to display the context (hospital/pharmacy/booking)
            }]);
        } catch (error) {
            console.error('Chatbot Error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                content: `🚨 Error: ${error.message}. Please check the server status or try again.`,
                context: 'error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Container fluid className="h-100 d-flex flex-column bg-light">
            {/* Header */}
            <Row className="bg-primary text-white py-3 mb-0">
                <Col>
                    <div className="d-flex align-items-center">
                        <div className="me-3">
                            <Badge bg="light" text="primary" className="p-2">
                                🤖
                            </Badge>
                        </div>
                        <div>
                            <h3 className="mb-0">{t('chatbot.headerTitle')}</h3>
                        </div>
                        {/* Display Session ID for debugging */}
                        <small className="ms-auto me-2 text-warning">{t('chatbot.sessionId')}: {sessionId ? sessionId.substring(0, 8) + '...' : 'New'}</small>
                    </div>
                </Col>
            </Row>

            {/* Messages */}
            <Row className="flex-grow-1 overflow-hidden">
                <Col>
                    <div
                        className="h-100 overflow-auto p-3"
                        style={{ maxHeight: 'calc(100vh - 200px)' }}
                    >
                        <ListGroup variant="flush">
                            {messages.map((message, index) => (
                                <ListGroup.Item
                                    key={index}
                                    className={`border-0 bg-transparent mb-3 ${
                                        message.type === 'user' ? 'text-end' : 'text-start'
                                    }`}
                                >
                                    <div className={`d-inline-flex align-items-start ${
                                            message.type === 'user' ? 'flex-row-reverse' : ''
                                        } gap-2`}>
                                        <Badge
                                            bg={message.type === 'user' ? 'primary' : (message.context === 'error' ? 'danger' : 'secondary')}
                                            className="p-2"
                                        >
                                            {message.type === 'user' ? '👤' : '🤖'}
                                        </Badge>
                                        <Card
                                            className={`shadow-sm ${
                                                message.type === 'user' ? 'bg-primary text-white' : ''
                                            }`}
                                            style={{ maxWidth: '70%' }}
                                        >
                                            <Card.Body className="py-2 px-3">
                                                <Card.Text
                                                    className="mb-0 small chatbot-output"
                                                    dangerouslySetInnerHTML={{ __html: message.content }}
                                                />
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </ListGroup.Item>
                            ))}

                            {isLoading && (
                                <ListGroup.Item className="border-0 bg-transparent mb-3 text-start">
                                    <div className="d-inline-flex align-items-start gap-2">
                                        <Badge bg="secondary" className="p-2">
                                            🤖
                                        </Badge>
                                        <Card className="shadow-sm" style={{ maxWidth: '70%' }}>
                                            <Card.Body className="py-2 px-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <Spinner animation="grow" size="sm" variant="primary" />
                                                    <small className="text-muted">{t('chatbot.thinking')}</small>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </ListGroup.Item>
                            )}
                            {/* Ref for auto-scrolling */}
                            <div ref={messagesEndRef} />
                        </ListGroup>
                    </div>
                </Col>
            </Row>

            {/* Input Form */}
            <Row className="bg-white border-top py-3">
                <Col>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-2">
                            <Col>
                                <Form.Control
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder={t('chatbot.inputPlaceholder')}
                                    disabled={isLoading}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isLoading || !text.trim()}
                                    className="d-flex align-items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner animation="border" size="sm" />
                                            {t('chatbot.sending')}
                                        </>
                                    ) : (
                                        <>
                                            📤 {t('chatbot.send')}
                                        </>
                                    )}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Col>
            </Row>
        </Container>
    )
}