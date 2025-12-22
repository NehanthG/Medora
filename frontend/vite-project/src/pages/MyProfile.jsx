import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { Camera, Mail, User, Phone } from "lucide-react";
import { Container, Card, Row, Col, Form, Image, Spinner, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export default function MyProfile() {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const { t } = useTranslation();
  const [selectedImg, setSelectedImg] = useState(null);
  const [profileData, setProfileData] = useState({
    fullName: authUser.fullName,
    email: authUser.email,
    phoneNumber: authUser.phoneNumber,
    dateOfBirth: authUser.dateOfBirth
  });

  useEffect(() => {
    if (authUser) {
      setProfileData({
        fullName: authUser.fullName || "",
        email: authUser.email || "",
        phoneNumber: authUser.phoneNumber || "",
        dateOfBirth: authUser.dateOfBirth 
          ? new Date(authUser.dateOfBirth).toISOString().split("T")[0] 
          : ""
      });
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile({
      profilePic: authUser.profilePic,
      fullName: profileData.fullName,
      email: profileData.email,
      phoneNumber: profileData.phoneNumber,
      dateOfBirth: profileData.dateOfBirth
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({
        profilePic: base64Image,
        fullName: authUser.fullName,
        email: authUser.email,
        phoneNumber: authUser.phoneNumber,
        dateOfBirth: authUser.dateOfBirth
      });
    };
  };

  if (!authUser) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card 
        className="p-4 shadow-sm w-100 border-0" 
        style={{ maxWidth: '900px', borderRadius: '16px' }}
      >
        <h3 className="mb-4 text-center fw-bold">{t('profile.title')}</h3>

        {/* Profile Image */}
        <div className="d-flex justify-content-center position-relative mb-4">
          <Image
            src={selectedImg || authUser.profilePic || "/avatar.png"}
            roundedCircle
            width={120}
            height={120}
            className="object-fit-cover border border-3 border-light shadow-sm"
            alt="Profile"
          />
          <label
            htmlFor="profilePicInput"
            className="position-absolute bg-primary rounded-circle p-2 d-flex justify-content-center align-items-center shadow"
            style={{
              bottom: 0,
              right: 'calc(50% - 60px)',
              transform: 'translate(50%, 50%)',
              cursor: 'pointer'
            }}
          >
            {isUpdatingProfile ? (
              <Spinner animation="border" size="sm" className="text-white" />
            ) : (
              <Camera size={18} className="text-white" />
            )}
            <input
              id="profilePicInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
              disabled={isUpdatingProfile}
            />
          </label>
        </div>

        {/* Editable Form */}
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <User className="me-2" size={16} />{t('profile.fullName')}
                </Form.Label>
                <Form.Control 
                  type="text" 
                  name="fullName"
                  value={profileData.fullName} 
                  onChange={(e)=>setProfileData({...profileData,fullName:e.target.value})}
                  className="py-2"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <Phone className="me-2" size={16} />{t('profile.phoneNumber')}
                </Form.Label>
                <Form.Control 
                  type="text" 
                  name="phoneNumber"
                  value={profileData.phoneNumber} 
                  onChange={(e)=>setProfileData({...profileData,phoneNumber:e.target.value})}
                  className="py-2"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                  <Mail className="me-2" size={16} />{t('profile.email')}
                </Form.Label>
                <Form.Control 
                  type="email" 
                  name="email"
                  value={profileData.email} 
                  onChange={(e)=>setProfileData({...profileData,email:e.target.value})}
                  className="py-2"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-semibold">{t('profile.dateOfBirth')}</Form.Label>
                <Form.Control 
                  type="date" 
                  name="dateOfBirth"
                  value={profileData.dateOfBirth} 
                  onChange={(e)=>setProfileData({...profileData,dateOfBirth:e.target.value})}
                  className="py-2"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-center mt-4">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isUpdatingProfile}
              className="px-5 py-2 fw-semibold rounded shadow-sm"
              style={{ fontSize: "16px" }}
            >
              {isUpdatingProfile ? <Spinner animation="border" size="sm" /> : t('profile.saveChanges')}
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}
