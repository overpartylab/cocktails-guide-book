// core
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// third party component
import Fuse from 'fuse.js';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChipInput from 'material-ui-chip-input';

// component
import Loader from '../../components/loader';
import {
    Container,
    Header,
    Item,
    Content
} from '../style.css.js';

// config and assets
import { STYLE } from '../../config/common';
import { RECOMMEND } from '../../config/search';
import SEARCH_TEXT from '../../assets/wording/search.json';

const DEFAULT_STATE = {
    value: [],
    signature: true,
    isSearch: false,
    isInit: false,
    list: [],
    searchResultList: [],
    showRecommend: false,
    expanded: '' 
};

// helper
const findExistInTwoArray = (array1, array2) => {
    for (let i = 0; i < array1.length; i += 1) {
        const find = array2.findIndex(elm => elm.toLowerCase() === array1[i].toLowerCase()) > -1
        if (find) return find;
    }
    return false;
};

const RecommendBlock = ({ dataObj, expanded, onItemSelect, onExpanded, showRecommend, onControlRecommend }) => {
    return (
        <>
            <StyledRecommendBlock>
                <OuterExpansionPanel
                    expanded={showRecommend}
                    onChange={onControlRecommend}
                >
                    <OuterExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <div>{SEARCH_TEXT.recommend}</div>
                    </OuterExpansionPanelSummary>
                    <OuterExpansionPanelDetails>
                    {
                        showRecommend && dataObj.map((e) => {
                            const { title, data } = e;
                            return (
                                <StyledExpansionPanel
                                    expanded={expanded === title}
                                    onChange={() => { onExpanded(title)} }
                                    key={`item-${title}`}
                                >
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                        <div>{title}</div>
                                    </ExpansionPanelSummary>
                                    <InnerExpansionPanelDetails>
                                        <ButtonGroup>
                                            {
                                                data.map((e, idx) => {
                                                    return (
                                                        <Button
                                                            key={`key-${idx}`}
                                                            variant="contained"
                                                            onClick={() => { onItemSelect(e)} }
                                                        >
                                                            {e}
                                                        </Button>
                                                    );
                                                })
                                            }
                                        </ButtonGroup>
                                    </InnerExpansionPanelDetails>
                                </StyledExpansionPanel>
                            )
                        })
                    }   
                    </OuterExpansionPanelDetails>
                </ OuterExpansionPanel>
            </StyledRecommendBlock>
        </>
    );
};

const Card = ({ value }) => {
    const { name: { zh, en }, igtoken } = value;
    const igPostUrl = `https://www.instagram.com/p/${igtoken}`;
    const url = `${igPostUrl}/media/?size=l`;
    const onClickPost = () => {
        window.open(igPostUrl, "_blank");
    };
    return (
        <IGPostCard>
            <CardTitle>
                <ItemName>
                    {`${zh} (${en})`}
                </ItemName>
                <Button
                    variant="contained"
                    onClick={onClickPost}
                    color="primary"
                >
                    {SEARCH_TEXT.button.more}
                </Button>
            </CardTitle>
            <Image url={url} onClick={onClickPost} />
        </IGPostCard>
    );
};

const Search = ({ searchPageData, getCocktailsList }) => {
    const [ userAction, setUserAction] = useState(DEFAULT_STATE);  

    const { isInit, cocktailsList } = searchPageData;
    const { value, signature, isSearch, searchResultList, showRecommend, expanded } = userAction;

    const onClickSearch = (e) => {
        cocktailsList.sort(() => Math.random() - 0.5);
        const searchResultList = cocktailsList.filter(e => {
            const keys = Object.values(e.keys);
            const fuse = new Fuse(keys, { includeScore: true });
            let filterRule = true;
            for (let i = 0; i < value.length; i += 1) {
                const result = fuse.search(value[i].toLowerCase());
                const weight = result.filter(e => (e.score < 0.3));
                filterRule = filterRule && (result.length > 0 && weight.length > 0);
                if (!filterRule) break;
            }
            if(signature === false) filterRule = filterRule && (e.signature === signature);
            return filterRule;
        });
        setUserAction({ ...userAction, searchResultList, expanded: '', isSearch: true, showRecommend: false });
    };
    const onSwitchSignature = (e) => {
        const signature = e.target.checked;
        setUserAction({ ...userAction, signature });
    };
    const onChipInputChange = (newValue) => {
        if (value.length < 3) {
            setUserAction({ ...userAction, value: [...value, newValue], isSearch: false });
        }
    };
    const onSelectChange = (newValue) => {
        const find = findExistInTwoArray(value, [newValue]);
        if (value.length < 3 && !find) {
            setUserAction({ ...userAction, value: [...value, newValue], isSearch: false });
        }
    };
    const handleDeleteChip = (chip) => {
        const index = value.indexOf(chip);
        if (index !== -1) value.splice(index, 1);
        setUserAction({ ...userAction, value, isSearch: false });
    };
    const onExpanded = (clickExpanded) => {
        const newExpanded = expanded === clickExpanded ? '' : clickExpanded
        setUserAction({ ...userAction,  expanded: newExpanded });
    };
    const onControlRecommend = () => {
        const status = !showRecommend
        setUserAction({ ...userAction,  showRecommend: status });
    };

    useEffect(() => {
        if (cocktailsList && cocktailsList.length === 0) {
            getCocktailsList();
        }
    }, []);

    return (
        <Container>
            <Header>
                <div>{SEARCH_TEXT.title}</div>
            </Header>
            {
                !isInit && <Loader />
            }
            {
                isInit && cocktailsList.length === 0 && (
                    <Item>
                        <Content>{SEARCH_TEXT.error_text}</Content>
                    </Item>
                )
            }
            {
                isInit && cocktailsList.length > 0 && (
                    <> 
                        <Item>
                            <Content>
                                <div>{SEARCH_TEXT.content}</div>
                                <div>{SEARCH_TEXT.tips}</div>
                            </Content>
                        </Item>
                        <Item>
                        <FormControlLabel
                            control={
                                <Switch
                                    color="primary"
                                    checked={signature}
                                    onChange={onSwitchSignature}
                                />
                            }
                            label={<SwitchText checked={signature}>{SEARCH_TEXT.switch_content}</SwitchText>}
                        />
                        </Item>
                        <Item>
                            <SearchContainer>
                                <SearchIndicator>
                                    <StyledSearchIcon />
                                </SearchIndicator>
                                <ChipInput
                                    label={SEARCH_TEXT.input_hint}
                                    value={value}
                                    fullWidth={true}
                                    newChipKeys={[]}
                                    allowDuplicates={false}
                                    onAdd={(chips) => onChipInputChange(chips)}
                                    onDelete={(chip, index) => handleDeleteChip(chip, index)}
                                />
                            </SearchContainer>
                            <Button
                                variant="contained"
                                onClick={onClickSearch}
                                color="primary"
                                disabled={value.length === 0}
                            >
                                {SEARCH_TEXT.button.search}
                            </Button>
                        </Item>
                        <Item>
                            <RecommendBlock
                                dataObj={RECOMMEND}
                                onItemSelect={onSelectChange}
                                showRecommend={showRecommend}
                                expanded={expanded}
                                onExpanded={onExpanded}
                                onControlRecommend={onControlRecommend}
                            />
                        </Item>
                        <Item>
                            {
                                searchResultList.length === 0 && value.length !== 0 && isSearch && (
                                    <div>{SEARCH_TEXT.no_result}</div>
                                )
                            }
                            {
                                isSearch && (
                                    <Cards>
                                        {
                                            searchResultList.map((cocktail, idx) => {
                                                if (idx > 4) return null;
                                                return (
                                                    <Card
                                                        key={`key-${idx}`}
                                                        value={cocktail}
                                                    />
                                                )
                                            })
                                        }
                                    </Cards>

                                )
                            }
                        </Item>
                    </>
                )
            }
        </Container>
    );
};

export default Search;

const SwitchText = styled.span`
    font-size: 14px;
    color: ${({checked}) => checked ? 'black' : 'grey'};
`;

const SearchContainer = styled.div`
    display: flex;
    width: 300px;
    margin-right: ${STYLE.PADDING}px;
`;

const SearchIndicator = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const StyledSearchIcon = styled(SearchIcon)`
    height: 48px;
`;

const Cards = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const CardTitle = styled.div`
    display: flex;
    width: 270px;
    text-align: center;
    font-size: 1rem;
    padding: 15px;
    && > button {
        margin-left: 10px;
    }
`;

const ItemName = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 190px;
`;

const IGPostCard = styled.div`
    margin: 10px;
    padding-bottom: 15px;
    background-color: white;
    box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
    transition: 0.3s;
    &&:hover {
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
    }
`;

const Image = styled.div`
    width: 300px;
    height: 300px;
    background-size: 100%;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url(${({ url }) => url});
    &&:hover {
        cursor: pointer;
    }
`;

const StyledExpansionPanel = styled(ExpansionPanel)`
    width: 320px;
    && button {
        margin: 5px;
    }
`;

const OuterExpansionPanel = styled(ExpansionPanel)`
    width: ${STYLE.MIN_WIDTH}px;
    &&& {
        background-color: #f4f4ec;
        box-shadow: none;
        margin-right: 20px;
    }
`;

const OuterExpansionPanelSummary = styled(ExpansionPanelSummary)`
    width: ${STYLE.MIN_WIDTH}px;
`;

const OuterExpansionPanelDetails = styled(ExpansionPanelDetails)`
    display: flex;
    flex-direction: column;
`;

const InnerExpansionPanelDetails = styled(ExpansionPanelDetails)`
    && {
        padding: ${STYLE.PADDING}px 15px;
    }
`;

const StyledRecommendBlock = styled.div`
    display: flex;
    flex-direction: column;
`;

const ButtonGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
`;
