# backend/tests/test_uploader.py

import pandas as pd

# Import the function we want to test
from datafool.services.uploader import _sanitize_dataframe
from pandas.testing import assert_frame_equal


def test_sanitize_dataframe_removes_commas():
    """
    Tests that the function correctly removes commas from a string column
    and converts it to a numeric type.
    """
    # 1. Arrange: Create a sample DataFrame with comma-formatted numbers
    data = {"Product": ["A", "B"], "Sales": ["1,000", "2,500"]}
    dirty_df = pd.DataFrame(data)

    # 2. Act: Run the function
    clean_df = _sanitize_dataframe(dirty_df)

    # 3. Assert: Check if the 'Sales' column is now numeric
    expected_data = {"Product": ["A", "B"], "Sales": [1000, 2500]}
    expected_df = pd.DataFrame(expected_data)

    # pandas.testing.assert_frame_equal is the best way to compare DataFrames
    assert_frame_equal(clean_df, expected_df)


def test_sanitize_dataframe_handles_non_numeric_text():
    """
    Tests that the function leaves regular text columns unchanged.
    """
    data = {"Product": ["A", "B"], "Description": ["Good", "Excellent"]}
    df = pd.DataFrame(data)

    # Act and Assert in one step
    # We expect the DataFrame to be identical after sanitation
    assert_frame_equal(_sanitize_dataframe(df.copy()), df)
