import React from 'react';
import styled from 'styled-components';

// component
import Header from './header/header';
import Footer from './footer/footer';
import Search from './search/search';
import Contact from './contact/contact';

import { STYLE } from '../config/common';

const PAGES = {
    SEARCH: 'search',
    CONTACT: 'contact'
}

const Main = () => {
    const [page, setPage] = React.useState(PAGES.SEARCH);
    return (
        <>
            <Header minwidth={STYLE.MIN_WIDTH} />
            <Container>
                {
                    page === PAGES.SEARCH && (<Search />)
                }
                {
                    page === PAGES.CONTACT && (<Contact />)
                }
            </Container>
            <Footer onPageChange={setPage} />
        </>
    );
};

export default Main;

const Container = styled.div`
    min-width: ${STYLE.MIN_WIDTH}px;
    padding: 64px 0px;
`;
