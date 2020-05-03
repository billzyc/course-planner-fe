import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import checkProps from '@jam3/react-check-extra-props';
import classnames from 'classnames';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

import styles from './DnDBoard.module.scss';

import { APIROUTES, apiBaseUrl } from '../../data/consts';
import { replaceSemester } from '../../redux/modules/semester';

import DnDCard from '../DnDCard/DnDCard';

export const DnDBoardType = {
  UNASSIGNED: 'unassigned',
  ASSIGNED: 'assigned'
};

const DnDBoard = forwardRef(({ id, semester, styleClass = DnDBoard.ASSIGNED }, ref) => {
  const semesterId = id;
  const [currentSemesterCourses, setCurrentSemesterCourses] = useState([]);
  const [cookies] = useCookies(['token']);
  const dispatch = useDispatch();
  const { courseInfo } = useSelector(state => state);

  const deleteBoard = () => {
    axios({
      method: 'delete',
      headers: { authorization: cookies.token },
      url: `${APIROUTES.SEMESTERS}${id}`,
      baseURL: apiBaseUrl
    })
      .then(response => {
        axios({
          method: 'get',
          headers: { authorization: cookies.token },
          url: APIROUTES.SEMESTERS,
          baseURL: apiBaseUrl
        })
          .then(response => {
            const data = response.data;
            dispatch(replaceSemester(data));
          })
          .catch(function(error) {
            console.log(error);
            window.alert('Update board error, please try again');
          });
      })
      .catch(function(error) {
        console.log(error);
        window.alert('Delete board error, please try again');
      });
  };

  const fetchCurrentSemesterCourses = () => {
    axios({
      method: 'get',
      headers: { authorization: cookies.token },
      url: APIROUTES.COURSEITEMS,
      params: { semester_query: semesterId },
      baseURL: apiBaseUrl
    })
      .then(response => {
        const data = response.data;
        setCurrentSemesterCourses(data);
      })
      .catch(function(error) {
        console.log(error);
        window.alert('Fetch course error, please try again');
      });
  };

  const updateCardPlacement = (cardId, card) => {
    const currentCourse = courseInfo.find(course => course.id === parseInt(cardId));
    const { course_number, course_subject } = currentCourse;
    axios({
      method: 'put',
      headers: { authorization: cookies.token },
      data: {
        course_subject: course_subject,
        course_number: course_number,
        semester_placement: semesterId === 'unassigned' ? null : semesterId
      },
      url: `${APIROUTES.COURSEITEMS}${cardId}/`,
      baseURL: apiBaseUrl
    })
      .then(response => {})
      .catch(function(error) {
        console.log(error);
        window.alert('Update card error, please try again');
      });
  };

  const drop = e => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const card = document.getElementById(cardId);
    card.style.display = 'block';
    e.target.appendChild(card);
    updateCardPlacement(cardId);
  };

  const dragOver = e => {
    e.preventDefault();
  };

  const renderCourseCards = () => {
    if (currentSemesterCourses.length > 0) {
      return currentSemesterCourses.map(course => {
        return (
          <DnDCard id={course.id} key={course.id} updateBoard={fetchCurrentSemesterCourses}>
            <p>
              {course.course_subject} {course.course_number}
            </p>
          </DnDCard>
        );
      });
    }
  };

  useImperativeHandle(ref, () => ({
    updateCourses: fetchCurrentSemesterCourses
  }));

  useEffect(() => {
    fetchCurrentSemesterCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id={id} onDrop={drop} onDragOver={dragOver} className={classnames(styles[styleClass])}>
      {semester && <p>{semester}</p>}
      {renderCourseCards()}
      {semesterId === DnDBoardType.UNASSIGNED ? null : (
        <button onClick={deleteBoard} className={styles.delete}>
          delete
        </button>
      )}
    </div>
  );
});

DnDBoard.propTypes = checkProps({});

DnDBoard.defaultProps = {};

export default DnDBoard;
