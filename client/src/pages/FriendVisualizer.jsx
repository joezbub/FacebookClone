import React, { useEffect, useState } from 'react';
import {Helmet} from "react-helmet";
import { Link } from 'react-router-dom';
import {
 Box, Button
} from '@chakra-ui/react'
import '../css/base.css'
import NavBar from '../components/NavBar/NavBar';
import { HomeState } from '../context/HomeProvider';

export default function FriendVisualizer() {

  const {me} = HomeState();

  return (
    (me && 
    <Box>
    <NavBar/>
    <div className="application">
        <Helmet>
          <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
            <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
            <script language="javascript" type="text/javascript" src="../js/jit.js"></script>
            <script language="javascript" type="text/javascript" src="../js/friendvisualizer.js"></script>
        </Helmet>
        <div id="container">
            <div id="center-container">
                <div id="infovis"></div>    
            </div>
        </div>
        <br/>
        <Link to="/"><Button colorScheme='telegram'>Back to home</Button></Link>
    </div>
    </Box>
    )
  )
}
