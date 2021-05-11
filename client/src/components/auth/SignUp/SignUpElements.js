import styled from 'styled-components'
import img from '../../../assets/auth2.jpeg'
import Input from "@material-ui/core/Input";
export const Container = styled.div`
    height: 700px;
    position: relative;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 0;
    overflow-y: scroll;
    
    background: linear-gradient(
        100deg,
        rgba(64, 98, 191, 1) 0%,
        rgba(10, 201, 122, 1) 100%
    );
    


`;

export const FormWrap = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    @media screen and(max-width: 460px){
        height: 80%;
    }
`;


export const FormContent = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    @media screen and(max-width: 480px){
        padding: 10px;
    }
`;

export const Form = styled.form`
    ${'' /* background: #010101; */}
    
    background-image: url(${img});
    max-width: 400px;
    height: auto;
    width: 100%;
    z-index: 1;
    display: grid;
    margin: 0 auto;
    padding: 80px 32px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);

    @media screen and(max-width: 400px){
        padding: 32px 32px;
    }
`;

export const FormH1 = styled.h1`
    margin-bottom: 40px;
    color: #fff;
    font-size: 20px;
    font-weight: 400;
    text-align: center;
`;

export const FormLabel = styled.label`
    margin-bottom: 8px;
    font-size: 14px;
    color: #fff;
`;

export const FormInput = styled(Input)`
    padding: 16px 16px;
    margin-bottom: 32px;
    border: none;
    border-radius: 4px;
    background: #fff;
    height: 50px;
`;

export const FormButton = styled.button`
    ${'' /* background: #01bf71; */}
    background: #9999ff;
    padding: 12px 0;
    border: none;
    border-radius: 4px;
    color: #fff;
    font-size: 20px;
    cursor: pointer;
`;
